import { Plan } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { CreateOrgDto } from './dto/create-org.dto';
import { UpdateOrgDto, UpdateOrgSubscriptionDto } from './dto/update-org.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { roundUpToNext100 } from 'src/utils/roundUp100';
import { getDomainFromEmail } from 'src/utils/getDomain';
import { CacheService } from 'src/cache/cache.service';
import { MailService } from 'src/mail/mail.service';
import { parseStringPromise } from 'xml2js';
import { PermissionsService } from 'src/permission/permission.service';
import { AuditService } from 'src/audit/audit.service';
import { AUDIT_EVENT } from 'src/audit/auditEvents';
import { permissionRoles, permissionsMap } from 'src/permission/permissions';

interface SamlMetadata {
  EntityDescriptor?: {
    $: {
      entityID: string;
      'xmlns:md': string;
    };
    IDPSSODescriptor: {
      $: {
        WantAuthnRequestsSigned: string;
        protocolSupportEnumeration: string;
      };
      KeyDescriptor: {
        $: { use: string };
        'ds:KeyInfo': {
          $: { 'xmlns:ds': string };
          'ds:X509Data': {
            'ds:X509Certificate': string;
          };
        };
      };
      NameIDFormat: string;
      SingleSignOnService: {
        $: {
          Binding: string;
          Location: string;
        };
      }[];
    };
  };
}
@Injectable()
export class OrgService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private cache: CacheService,
    private mailService: MailService,
    private permissionService: PermissionsService,
    private auditService: AuditService,
  ) {}

  async create(createOrgDto: CreateOrgDto) {
    const planKey = createOrgDto.planKey || 'free';
    const plan = await this.cache.wrap(
      `plan:${planKey}`,
      () => {
        return this.prisma.plan.findFirst({
          where: {
            key: planKey,
          },
        });
      },
      86400,
    );

    if (!plan) {
      console.log('missingPlan', planKey);
    }

    const newOrg = await this.prisma.organization.create({
      data: {
        name: createOrgDto.orgName,
        seatCount: roundUpToNext100(createOrgDto.orgSize) || 0,
        email: createOrgDto.orgEmail.toLowerCase(),
        logoURL: createOrgDto.orgLogo,
        defaultPlanID: plan?.id,
      },
    });
    if (createOrgDto.orgDomain) {
      await this.prisma.domain.create({
        data: {
          orgID: newOrg.id,
          domain: createOrgDto.orgDomain,
        },
      });
    }

    if (createOrgDto.admin) {
      await this.prisma.organizationAdmin.create({
        data: {
          orgId: newOrg.id,
          userId: createOrgDto.admin,
          roles: ['org_owner'],
        },
      });
    }
    const address =
      createOrgDto.country && createOrgDto.postalCode
        ? {
            country: createOrgDto.country,
            postal_code: createOrgDto.postalCode,
          }
        : undefined;

    const stripeCustomer = await this.stripeService.createStripeCustomer(
      undefined,
      newOrg,
      address,
    );

    const updatedOrg = await this.prisma.organization.update({
      where: { id: newOrg.id },
      data: {
        stripeCustomerID: stripeCustomer.id,
      },
    });
    //TODO Send Verification Email

    return updatedOrg;
  }

  async hasSpace(email: string) {
    const domain = getDomainFromEmail(email);
    if (!domain) {
      return { hasOpenSeats: false, org: undefined, plan: undefined };
    }
    const org = await this.prisma.organization.findFirst({
      where: { domains: { some: { domain } } },
    });

    if (!org) {
      return { hasOpenSeats: false, org: undefined, plan: undefined };
    }

    // TODO Check if org if active

    const currentUsers = await this.prisma.subscription.count({
      where: { managedByID: org?.id },
    });

    let plan: Plan | undefined | null = undefined;

    if (typeof org.defaultPlanID === 'string') {
      plan = await this.cache.wrap(
        `plan:${org.defaultPlanID}`,
        () => {
          return this.prisma.plan.findFirst({
            // TODO Figure out why this is breaking

            where: { id: org.defaultPlanID || '' },
          });
        },
        86400,
      );
    }

    if ((org?.seatCount || 0) > currentUsers) {
      return { hasOpenSeats: true, org, plan };
    }
    return { hasOpenSeats: false, org: undefined, plan: undefined };
  }

  async getOrgUsers(id: string, pageSize = 20, page = 1) {
    const pageUsers = await this.cache.wrap(
      `orgUsers:${id}:page:${page}:size:${pageSize}`,
      () =>
        this.prisma.user.findMany({
          where: {
            subscriptions: {
              some: {
                managedByID: id,
                status: 'org-managed',
              },
            },
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: {
            createdAt: 'desc', // consistent ordering is important
          },
        }),
      600,
    );

    const totalCount = await this.cache.wrap(
      `totalOrgUsers:${id}`,
      () =>
        this.prisma.user.count({
          where: {
            subscriptions: {
              some: { managedByID: id },
            },
          },
        }),
      600,
    );

    const totalPages = Math.ceil(totalCount / pageSize);

    return { totalCount, page, pageSize, users: pageUsers, totalPages };
  }

  async getOrgAdmins(id: string) {
    const admins = await this.cache.wrap(
      `orgAdmins:${id}`,
      () =>
        this.prisma.user.findMany({
          where: {
            orgAdminLinks: {
              some: { orgId: id },
            },
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            orgAdminLinks: {
              where: { orgId: id },
              select: {
                roles: true,
              },
              take: 1,
            },
          },
        }),

      600,
    );

    const result = admins.map((u) => ({
      ...u,
      orgAdminLink: u.orgAdminLinks[0] || null,
    }));

    return result;
  }

  async addOrgAdmin(
    orgID: string,
    email: string,
    roles?: string[],
    firstName?: string,
    lastName?: string,
  ) {
    console.log({ roles });

    const user = await this.prisma.user.findFirst({ where: { email } });
    const org = await this.prisma.organization.findFirst({
      where: { id: orgID },
      select: { name: true },
    });
    console.log({ user });
    await this.auditService.logEvent(
      AUDIT_EVENT.ADMIN_ADDED,
      undefined,
      undefined,
      { email, orgID },
    );
    if (user !== null) {
      await this.prisma.organizationAdmin.create({
        data: {
          orgId: orgID,
          userId: user.id,
          roles: roles ? roles : ['viewer'],
        },
      });
      await this.mailService.sendAdminAddedEmail({
        to: email,
        context: {
          firstName: user.firstName,
          orgName: org?.name || 'Organization',
        },
      });
      return user;
    }
    const newUser = await this.prisma.user.create({
      data: {
        password: '123abc',
        firstName,
        lastName,
        passwordRestRequired: true,
        email: email.toLowerCase(),
      },
    });
    await this.prisma.organizationAdmin.create({
      data: {
        orgId: orgID,
        userId: newUser.id,
        roles: roles ? roles : ['viewer'],
      },
    });
    await this.mailService.sendAdminAddedEmail({
      to: email,
      context: {
        firstName: newUser.firstName,
        orgName: org?.name || 'Organization',
      },
    });
    return newUser;
  }

  removeUserFromOrg(orgID: string, userID: number) {
    // Remove Cache
    return this.prisma.subscription.updateMany({
      where: {
        userID,
        managedByID: orgID,
      },
      data: {
        status: 'org-admin-canceled',
      },
    });
  }

  async updateAdminOrgDetails(
    orgID: string,
    userID: number,
    details: { roles: string[] },
  ) {
    await this.cache.del(`currentUser:${userID}`);

    const currentLink = await this.prisma.organizationAdmin.findUnique({
      where: {
        userId_orgId: {
          userId: userID,
          orgId: orgID,
        },
      },
      select: { roles: true },
    });

    // ensure that at least one other owner still exists.
    const removingOwnerRole =
      currentLink?.roles.includes('org_owner') &&
      !details.roles.includes('org_owner');

    if (removingOwnerRole) {
      const otherOwners = await this.prisma.organizationAdmin.count({
        where: {
          orgId: orgID,
          roles: {
            has: 'org_owner',
          },
          NOT: { userId: userID },
        },
      });

      if (otherOwners === 0) {
        throw new Error(
          'Each organization must have at least one owner. Please assign another owner before removing this one.',
        );
      }
    }
    return this.prisma.organizationAdmin.update({
      where: {
        userId_orgId: {
          userId: userID,
          orgId: orgID,
        },
      },
      data: details,
    });
  }

  async removeAdminFromOrg(orgID: string, userID: number) {
    await this.cache.del(`currentUser:${userID}`);
    await this.cache.del(`orgAdmins:${orgID}`);
    await this.auditService.logEvent(
      AUDIT_EVENT.ADMIN_REMOVE,
      userID,
      undefined,
      { orgID },
    );
    return this.prisma.organizationAdmin.delete({
      where: {
        userId_orgId: {
          userId: userID,
          orgId: orgID,
        },
      },
    });
  }

  findAll() {
    return this.prisma.organization.findMany({
      include: {
        _count: {
          select: {
            orgSubscription: true,
            orgAdmins: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string, includeSubscription?: string) {
    return this.prisma.organization.findFirst({
      where: { id },
      include: {
        domains: true,
        orgSubscription: includeSubscription === 'true' || false,
      },
    });
  }

  update(id: string, updateOrgDto: UpdateOrgDto) {
    return this.prisma.organization.update({
      where: { id },
      data: updateOrgDto,
    });
  }

  async updateSubscription(id: string, updateOrgDto: UpdateOrgSubscriptionDto) {
    const planKey = updateOrgDto.subscriptionType;
    const plan = await this.cache.wrap(
      `plan:${planKey}`,
      () => {
        return this.prisma.plan.findFirst({
          where: {
            key: planKey,
          },
        });
      },
      86400,
    );

    if (!plan) {
      console.log('missingPlan', planKey);
      throw Error(`Missing Plan: ${planKey}`);
    }

    const userPlan = await this.cache.wrap(
      `plan:${plan.userKey}`,
      () => {
        return this.prisma.plan.findFirst({
          where: {
            key: plan.userKey || 'free',
          },
        });
      },
      86400,
    );

    await this.prisma.subscription.create({
      data: {
        orgID: id,
        status: 'active',
        planID: plan.id,
        stripeSubId: updateOrgDto.stripeSubscriptionID,
      },
    });

    return this.prisma.organization.update({
      where: { id },
      data: {
        seatCount: updateOrgDto.userCount,
        defaultPlanID: userPlan?.id,
      },
    });
  }

  remove(id: string) {
    return `This action removes a #${id} org`;
  }

  async getMyPermissionForOrg(orgID: string, userID: number) {
    try {
      const orgAdmin = await this.prisma.organizationAdmin.findFirst({
        where: { userId: userID, orgId: orgID },
      });

      return this.permissionService.getPermissionsForRoles(
        orgAdmin?.roles || [],
      );
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  getRolesForOrg(orgID: string) {
    try {
      const roles = permissionRoles;
      return roles;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async xmlToSSOData(id: string, xml: string) {
    try {
      const xmlData = await this.parseSamlMetadata(xml);
      await this.prisma.organization.update({
        where: { id },
        data: {
          ssoEnabled: true,
          ssoCert: xmlData.cert,
          // ssoIssuer: xmlData.issuer,
          ssoEntryPoint: xmlData.entryPoint,
        },
      });
    } catch (error) {
      console.log(error);
      throw Error('Error Parsing file');
    }
  }

  async parseSamlMetadata(metadataUrl: string) {
    // SSRF protection: only allow URLs on allowed domains (example.com), and HTTP/S protocol
    let url;
    try {
      url = new URL(metadataUrl);
    } catch (e) {
      throw new Error('Invalid URL for SAML metadata.');
    }
    // Only allow http or https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Only HTTP(S) URLs are allowed for SAML metadata.');
    }
    // Prevent access to localhost, 127.*, private networks
    const hostname = url.hostname;
    const forbiddenHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '169.254.169.254', // AWS metadata, etc.
    ];
    if (forbiddenHosts.includes(hostname)) {
      throw new Error('Forbidden host.');
    }
    // Prevent private or loopback IPs: use a simple regex here, or do a DNS lookup if you want
    // Regex for 10.*, 192.168.*, 172.16-31.*
    const privateIpRegex = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
    if (privateIpRegex.test(hostname)) {
      throw new Error('Forbidden private network address.');
    }
    // Optionally, maintain a domain allow-list for extra safety
    // Example: allow *.safedomain.com
    // if (!hostname.endsWith(".safedomain.com")) {
    //   throw new Error("Only safedomain.com domains allowed.");
    // }
    const res = await fetch(metadataUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch metadata: ${res.statusText}`);
    }
    const xml = await res.text();

    console.log('xml', xml);

    const parsed = (await parseStringPromise(xml, {
      explicitArray: false,
      tagNameProcessors: [(name) => name.replace('md:', '')],
    })) as SamlMetadata;

    console.log('parsed', parsed);
    const entity = parsed.EntityDescriptor;

    console.log({
      sso: JSON.stringify(entity),
    });

    const entryPoint =
      entity?.IDPSSODescriptor.SingleSignOnService?.[0].$.Location || '';
    const cert =
      entity?.IDPSSODescriptor.KeyDescriptor['ds:KeyInfo']['ds:X509Data'][
        'ds:X509Certificate'
      ];

    const issuer = entity?.$?.entityID;

    console.log({ entryPoint, cert, issuer });

    return { entryPoint, cert, issuer };
  }
}
