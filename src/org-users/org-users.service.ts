import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateOrgAdminDto,
  CreateOrgUserDto,
  InviteClientDto,
} from './dto/create-org-user.dto';
import { UpdateOrgUserDto } from './dto/update-org-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CacheService } from 'src/cache/cache.service';
import { MailService } from 'src/mail/mail.service';
import { AuditService } from 'src/audit/audit.service';
import { AUDIT_EVENT } from 'src/audit/auditEvents';
import { OrgService } from 'src/org/org.service';

@Injectable()
export class OrgUsersService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private mailService: MailService,
    private auditService: AuditService,
    private orgService: OrgService,
  ) {}

  async createOrgMember(createOrgUserDto: CreateOrgUserDto) {
    const { email, orgID, firstName, lastName } = createOrgUserDto;
    const user = await this.prisma.user.findFirst({ where: { email } });
    const org = await this.prisma.organization.findFirst({
      where: { id: orgID },
      select: { name: true },
    });
    console.log({ user });
    await this.auditService.logEvent(
      AUDIT_EVENT.USER_ADDED,
      undefined,
      undefined,
      { email, orgID, type: 'member' },
    );
    if (user !== null) {
      const currentOrgUser = await this.prisma.orgUser.findFirst({
        where: {
          orgId: orgID,
          userId: user.id,
        },
      });

      console.log(currentOrgUser);

      if (currentOrgUser !== null) {
        await this.prisma.orgUser.update({
          where: {
            userId_orgId: {
              orgId: orgID,
              userId: user.id,
            },
          },
          data: {
            dataAccess: 'full',
            orgId: orgID,
            userId: user.id,
            status: 'active',
            subscriptionType: 'org-managed',
            roles: ['member', ...(currentOrgUser?.roles || [])],
          },
        });
      } else {
        await this.prisma.orgUser.create({
          data: {
            dataAccess: 'full',
            orgId: orgID,
            userId: user.id,
            subscriptionType: 'org-managed',
            roles: ['member'],
          },
        });
      }

      await this.mailService.sendOrgUpgradedEmail({
        to: email,
        context: {
          firstName: user.firstName,
          orgName: org?.name || 'Organization',
          tierName: 'Premium',
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
    await this.prisma.orgUser.create({
      data: {
        dataAccess: 'full',
        orgId: orgID,
        userId: newUser.id,
        roles: ['member'],
      },
    });
    await this.mailService.sendWelcomeOrgEmail({
      to: email,
      context: {
        tierName: 'Premium',
        firstName: newUser.firstName,
        orgName: org?.name || 'Organization',
      },
    });
    return newUser;
  }

  async createOrgClientInvite(
    createOrgClientDto: InviteClientDto,
    currentUserID: number,
  ) {
    const { email, orgID, firstName } = createOrgClientDto;
    const org = await this.prisma.organization.findFirst({
      where: { id: orgID },
      select: { name: true },
    });

    if (!org) {
      throw new BadRequestException({
        code: 'MISSING_ORG',
        message: 'Org Connection could not be made',
      });
    }

    await this.auditService.logEvent(
      AUDIT_EVENT.USER_INVITED,
      undefined,
      undefined,
      { email, orgID, type: 'client' },
    );

    const invite = await this.orgService.generateOnTimeInviteCode(
      orgID,
      currentUserID,
    );

    await this.mailService.sendClientInvite({
      to: email,
      context: {
        firstName,
        orgName: org.name,
        inviteCode: invite.code,
      },
    });

    return { success: true };
  }

  async createOrgAdmin(createOrgUserDto: CreateOrgAdminDto) {
    const { email, orgID, firstName, lastName, roles } = createOrgUserDto;
    let user = await this.prisma.user.findFirst({ where: { email } });
    const org = await this.prisma.organization.findFirst({
      where: { id: orgID },
      select: { name: true },
    });
    console.log({ user });
    await this.auditService.logEvent(
      AUDIT_EVENT.ADMIN_ADDED,
      undefined,
      undefined,
      { email, orgID, type: 'admin' },
    );
    if (user === null) {
      user = await this.prisma.user.create({
        data: {
          password: '123abc',
          firstName,
          lastName,
          passwordRestRequired: true,
          email: email.toLowerCase(),
        },
      });
    }

    const currentOrgUser = await this.prisma.orgUser.findFirst({
      where: {
        orgId: orgID,
        userId: user.id,
      },
    });

    if (currentOrgUser !== null) {
      await this.prisma.orgUser.update({
        where: {
          userId_orgId: {
            orgId: orgID,
            userId: user.id,
          },
        },
        data: {
          dataAccess: 'none',
          orgId: orgID,
          userId: user.id,
          status: 'active',
          subscriptionType: 'user-managed',
          roles: roles
            ? [...roles, ...(currentOrgUser?.roles || [])]
            : ['viewer', ...(currentOrgUser?.roles || [])],
        },
      });
    } else {
      await this.prisma.orgUser.create({
        data: {
          dataAccess: 'none',
          orgId: orgID,
          userId: user.id,
          subscriptionType: 'user-managed',
          roles: roles ? roles : ['viewer'],
        },
      });
    }

    await this.mailService.sendAdminAddedEmail({
      to: email,
      context: {
        firstName: firstName,
        orgName: org?.name || 'Organization',
      },
    });

    await this.cache.del(`orgAdmins:${orgID}`);
    return user;
  }

  findAll() {
    return `This action returns all orgUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orgUser`;
  }

  async update(id: string, updateOrgUserDto: UpdateOrgUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { orgID, ...data } = updateOrgUserDto;
    await this.prisma.orgUser.update({
      where: {
        id,
      },
      data: data,
    });
    return { success: true };
  }

  async removeFromOrg(id: string) {
    const user = await this.prisma.orgUser.findFirst({
      where: {
        id,
      },
    });

    if (user) {
      await this.prisma.orgUser.update({
        where: { id },
        data: {
          status: 'inactive',
          removedAt: new Date(),
        },
      });
      return { success: true };
    }
    return { success: false };
  }

  async verifyJoinCode(code: string) {
    const inviteCode = await this.prisma.orgInviteCode.findFirst({
      where: { code },
    });
    const now = new Date();

    if (inviteCode == null) {
      return { valid: false, message: 'Could not find invite code' };
    }

    if (inviteCode.disabledAt) {
      return { valid: false, message: 'Invite has expired' };
    }

    if (inviteCode.expiresAt && inviteCode.expiresAt < now) {
      return { valid: false, message: 'Invite has expired' };
    }

    if (
      inviteCode.maxUses !== null &&
      inviteCode.usedCount >= inviteCode.maxUses
    ) {
      return { valid: false, message: 'Invite code has already been used' };
    }

    // TODO Check org to see if there is space
    // if (
    //   inviteCode?.maxUses !== null &&
    //   inviteCode?.maxUses >= inviteCode?.usedCount
    // ) {
    //   return { valid: false, message: 'Invite code has already been used' };
    // }

    const org = await this.prisma.organization.findFirst({
      where: { id: inviteCode.orgID },
    });

    return { valid: true, org };
  }

  async joinOrgWithCode(code: string, userID: number) {
    const inviteCode = await this.prisma.orgInviteCode.findFirst({
      where: { code },
    });

    if (inviteCode === null) {
      throw new BadRequestException({
        code: 'MISSING_INVITE_CODE',
        message: 'Invite code could not be found',
      });
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userID },
    });

    if (user === null) {
      throw new BadRequestException({
        code: 'MISSING_USER',
        message: 'User could not be found',
      });
    }

    const currentOrgUser = await this.prisma.orgUser.findFirst({
      where: {
        userId: userID,
        orgId: inviteCode.orgID,
      },
    });

    switch (inviteCode.role) {
      case 'client':
        await this.prisma.orgUser.upsert({
          where: {
            userId_orgId: {
              userId: userID,
              orgId: inviteCode.orgID,
            },
          },
          create: {
            dataAccess: 'consented',
            orgId: inviteCode?.orgID,
            userId: userID,
            status: 'active',
            subscriptionType: 'user-managed',
            roles: ['client'],
          },
          update: {
            dataAccess: 'consented',
            subscriptionType: 'user-managed',
            roles: ['client', ...(currentOrgUser?.roles || [])],
          },
        });
        break;
      case 'member':
        await this.prisma.orgUser.upsert({
          where: {
            userId_orgId: {
              userId: userID,
              orgId: inviteCode.orgID,
            },
          },
          create: {
            dataAccess: 'full',
            orgId: inviteCode?.orgID,
            userId: userID,
            status: 'active',
            subscriptionType: 'org-managed',
            roles: ['member'],
          },
          update: {
            dataAccess: 'full',
            subscriptionType: 'org-managed',
            roles: ['member', ...(currentOrgUser?.roles || [])],
          },
        });
        break;

      default:
        await this.prisma.orgUser.create({
          data: {
            dataAccess: 'none',
            orgId: inviteCode?.orgID,
            userId: userID,
            status: 'active',
            roles: [...(currentOrgUser?.roles || [])],
          },
        });
        break;
    }

    await this.auditService.logEvent(
      AUDIT_EVENT.USER_CREATED,
      undefined,
      undefined,
      {
        email: user.email,
        orgID: inviteCode.orgID,
        type: inviteCode.role,
        via: 'inviteCode',
      },
    );

    await this.prisma.orgInviteCode.update({
      where: { code },
      data: { usedCount: inviteCode?.usedCount ? inviteCode.usedCount + 1 : 1 },
    });
    return { success: true };
  }

  async findMyConnections(userID: number) {
    return await this.prisma.orgUser.findMany({
      where: {
        userId: userID,
      },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            logoURL: true,
          },
        },
      },
    });
  }
}
