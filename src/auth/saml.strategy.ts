import { Injectable, Body } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import {
  MultiSamlStrategy,
  Profile,
  SamlConfig,
} from '@node-saml/passport-saml';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';
import { UsersService } from 'src/users/users.service';

interface SamlProfile extends Profile {
  nameID: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  givenName?: string;
  sn?: string;
}

@Injectable()
export class DynamicSamlStrategy extends PassportStrategy(
  MultiSamlStrategy,
  'saml',
) {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
    private subscriptions: SubscriptionsService,
  ) {
    const cert = (process.env.SAML_CERT || '')
      .replace(/\\n/g, '\n')
      .replace(/\r/g, '')
      .trim();
    // const cert = ''; // blank

    if (!cert) {
      console.warn(
        '⚠️ SAML_CERT missing — disable signature checks for local testing',
      );
    }
    super(
      {
        passReqToCallback: true,

        // 🔹 Called before redirect to IdP
        getSamlOptions: async (
          req: any,
          done: (err: Error | null, samlOptions?: SamlConfig) => void,
        ) => {
          console.log(
            '⚡ getSamlOptions CALLED with',
            req.query,
            req.body,
            req.session,
          );
          try {
            let domain: string | undefined;

            // When first hitting /auth/sso?email=
            if (req.query.email) {
              domain = (req.query.email as string).split('@')[1];
              // Optional: persist to session if you use sessions
              req.session = req.session || {};
              req.session.ssoDomain = domain;
            }

            // On callback, RelayState comes in body
            if (!domain && req.body?.RelayState) {
              domain = req.body.RelayState;
            }

            // Fallback to session if available
            if (!domain && req.session?.ssoDomain) {
              domain = req.session.ssoDomain;
            }

            if (!domain) {
              return done(new Error('Missing email domain (no RelayState)'));
            }

            const orgDomain = await this.prisma.domain.findFirst({
              where: { domain },
              include: { org: true },
            });

            if (!orgDomain?.org?.ssoEnabled) {
              return done(new Error('SSO not configured for this domain'));
            }

            const org = orgDomain.org;
            const dynamicCert =
              org.ssoCert?.replace(/\\n/g, '\n').trim() || cert;

            const samlOptions: SamlConfig = {
              callbackUrl: `${process.env.API_URL}/auth/sso/callback`,
              entryPoint: org.ssoEntryPoint || process.env.SAML_ENTRYPOINT!,
              issuer: org.ssoIssuer || process.env.SAML_ISSUER!,
              idpCert: dynamicCert,
              signatureAlgorithm: 'sha256',
              acceptedClockSkewMs: -1,
              wantAuthnResponseSigned: false, // ← toggle these
              wantAssertionsSigned: true, // ← based on your IdP
              disableRequestedAuthnContext: true,
            };

            console.log('✅ Loaded dynamic SAML config:', {
              entryPoint: samlOptions.entryPoint,
              issuer: samlOptions.issuer,
            });

            return done(null, samlOptions);
          } catch (err) {
            done(err as Error);
          }
        },
      },
      // 🔹 Called when SAML response is posted back to /callback
      async (
        req: any,
        profile: SamlProfile,
        done: (err: Error | null, user?: User) => void,
      ) => {
        try {
          console.log('🧭 VALIDATE SAML RESPONSE', profile);

          const email = this.extractSamlField(profile, [
            'email',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
          ]);

          if (!email) {
            console.error('❌ Missing email in SAML profile');
            return done(new Error('Missing email in SAML profile'));
          }

          const domain = email.split('@')[1];
          const orgDomain = await this.prisma.domain.findFirst({
            where: { domain },
            include: { org: true },
          });

          const org = orgDomain?.org;
          if (!org) return done(new Error('Organization not found'));

          const user = await this.users.upsertUser({
            email,
            firstName: this.extractSamlField(profile, [
              'firstName',
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
              'http://schemas.auth0.com/nickname',
            ]),
            lastName: this.extractSamlField(profile, [
              'lastName',
              'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
            ]),
            password: '',
          });

          await this.subscriptions.upsetOrgManagedSubscription({
            userID: user.id,
            orgID: org.id,
          });

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      },
    );
  }
  validate() {
    return null;
  }

  extractSamlField(profile: any, keys: string[]) {
    for (const k of keys) {
      if (profile[k]) return profile[k] as string;
      if (profile.attributes?.[k]) return profile.attributes[k] as string;
    }
    return undefined;
  }
}

//   async validate(
//     req: Request,
//     profile: SamlProfile,
//     done: (err: Error | null, config?: SamlConfig | User) => void,
//   ) {
//     try {
//       console.log('🧭 VALIDATE SAML RESPONSE', profile);
//       // const email = (profile as any).email || profile.nameID;

//       // if (!email) {
//       //   return done(new Error('Missing email in SAML profile'));
//       // }

//       // const domain = email.split('@')[1];
//       // const orgDomain = await this.prisma.domain.findFirst({
//       //   where: { domain },
//       //   include: { org: true },
//       // });

//       // const org = orgDomain?.org;
//       // if (!org) return done(new Error('Organization not found'));

//       // const user = await this.users.upsertUser({
//       //   email,
//       //   firstName: (profile as any).firstName,
//       //   lastName: (profile as any).lastName,
//       //   password: '',
//       // });

//       // await this.subscriptions.upsetOrgManagedSubscription({
//       //   userID: user.id,
//       //   orgID: org.id,
//       // });

//       // done(null, user);
//       done(null);
//     } catch (err) {
//       done(err as Error);
//     }
//   }
// }
