import { Logger } from '@nestjs/common';
import type { BetterAuthOptions } from 'better-auth';
import { MailService } from 'src/mail/mail.service';
import { StripeService } from 'src/stripe/stripe.service';
import { AuditService } from 'src/audit/audit.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { error } from 'console';
import { CacheService } from 'src/cache/cache.service';

const logger = new Logger('BetterAuthHooks');

/**
 * Returns the `databaseHooks` block for the Better Auth config.
 *
 * These hooks run after Better Auth writes to the database, giving us a seam
 * to perform side effects (welcome email, Stripe customer, audit log) without
 * duplicating the logic that lives in the legacy register flow.
 *
 * Called from `createAuth()` in `src/auth/better-auth.ts`.
 */
export function createBetterAuthHooks(
  mailService: MailService,
  stripeService: StripeService,
  auditService: AuditService,
  prisma: PrismaService,
  cacheService: CacheService,
): BetterAuthOptions['databaseHooks'] {
  return {
    user: {
      create: {
        // Ensure the non-nullable User.password column is always satisfied.
        // This runs before the DB insert so any missing field can be defaulted.
        before: async (user) => {
          return {
            data: {
              ...user,
              password: (user as Record<string, unknown>).password ?? '',
            },
          };
        },

        // Post-signup side effects: welcome email, Stripe customer, audit log.
        after: async (baUser) => {
          // Load the full User row using the baId bridge so we have the
          // integer `id` needed by Stripe and the audit log.
          const user = await prisma.user.findFirst({
            where: { baId: baUser.id },
          });

          if (!user) {
            logger.warn(
              `BetterAuth user created (id=${baUser.id}) but no matching User row found. Skipping post-signup hooks.`,
            );
            return;
          }

          // 1. MailTrap contact
          try {
            await mailService.addContactToMailTrap(user);
          } catch (err) {
            logger.error('Failed to add MailTrap contact after BA signup', err);
          }

          // 2. Welcome email
          try {
            await mailService.sendWelcomeEmail({
              to: user.email,
              context: {
                firstName: user.firstName,
                token: user.baId ?? '',
              },
            });
          } catch (err) {
            logger.error('Failed to send welcome email after BA signup', err);
          }

          // 3. Stripe customer
          try {
            const customer = await stripeService.createStripeCustomer(user);
            if (customer?.id) {
              await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerID: customer.id },
              });
            }
          } catch (err) {
            logger.error(
              'Failed to create Stripe customer after BA signup',
              err,
            );
          }

          // 4. Create Limited Free Trial
          try {
            const freePlan = await cacheService.wrap(
              'plan:limited-trial',
              () => {
                return prisma.plan.findFirst({
                  where: { key: 'limited-trial' },
                });
              },
              86400,
            );

            if (!freePlan) {
              throw new error('Missing Free Trial Plan');
            }

            await prisma.subscription.create({
              data: {
                userID: user.id,
                planID: freePlan.id,
                status: 'trialing',
              },
            });
          } catch (error) {
            logger.error('Failed to create free trial after BA signup', error);
          }

          // 5. Audit log
          try {
            await auditService.logEvent('user.signup.better-auth', user.id);
          } catch (err) {
            logger.error('Failed to write audit log after BA signup', err);
          }
        },
      },
    },
  };
}
