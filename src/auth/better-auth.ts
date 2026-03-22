import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { magicLink } from 'better-auth/plugins';
import { PrismaService } from 'src/prisma/prisma.service';
import bcrypt from 'bcrypt';
import type { BetterAuthOptions } from 'better-auth';
import { Prisma } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

export type SendMagicLinkFn = (data: {
  email: string;
  url: string;
  token: string;
}) => Promise<void>;

export type SendResetPasswordFn = (data: {
  user: { email: string };
  url: string;
  token: string;
}) => Promise<void>;

/**
 * Better Auth uses a string "id" field for users, but our User model uses an
 * Int primary key. We bridge this with the `baId` String field (a cuid) that
 * was added to User specifically for Better Auth.
 *
 * This proxy intercepts all Prisma calls on the `user` model and:
 *   - Rewrites `where.id` → `where.baId`
 *   - Rewrites `data.id`  → `data.baId` on create/update
 *   - Rewrites `result.id` ← `result.baId` on every returned row
 *   - Injects `baId: true` into any `select` so it is always available
 */
function buildBaUserProxy(prisma: PrismaService, userService: UsersService) {
  function transformWhere(where: Record<string, unknown> | undefined) {
    if (!where) return where;
    const { id, ...rest } = where;
    return id !== undefined ? { ...rest, baId: id } : rest;
  }

  function transformData(data: Record<string, unknown> | undefined) {
    if (!data) return data;
    const { id, ...rest } = data;
    return id !== undefined ? { ...rest, baId: id } : rest;
  }

  function mapResult(row: Record<string, unknown> | null) {
    if (!row) return null;
    return { ...row, id: row.baId };
  }

  function withBaId(select: Record<string, unknown> | undefined) {
    return select ? { ...select, baId: true } : undefined;
  }

  const userProxy = {
    async create({
      data,
      select,
      ...opts
    }: Record<string, unknown> & {
      data: Record<string, unknown>;
      select?: Record<string, unknown>;
    }) {
      const row = await (prisma.user as any).create({
        data: transformData(data),
        select: withBaId(select),
        ...opts,
      });

      return mapResult(row);
    },

    async findFirst({
      where,
      select,
      ...opts
    }: Record<string, unknown> & {
      where?: Record<string, unknown>;
      select?: Record<string, unknown>;
    }) {
      const row = await (prisma.user as any).findFirst({
        where: transformWhere(where),
        select: withBaId(select),
        ...opts,
      });
      return mapResult(row);
    },

    async findMany({
      where,
      select,
      ...opts
    }: Record<string, unknown> & {
      where?: Record<string, unknown>;
      select?: Record<string, unknown>;
    }) {
      const rows: Record<string, unknown>[] = await (
        prisma.user as any
      ).findMany({
        where: transformWhere(where),
        select: withBaId(select),
        ...opts,
      });
      return rows.map(mapResult);
    },

    async update({
      where,
      data,
      select,
      ...opts
    }: Record<string, unknown> & {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
      select?: Record<string, unknown>;
    }) {
      const row = await (prisma.user as any).update({
        where: transformWhere(where),
        data: transformData(data),
        select: withBaId(select),
        ...opts,
      });
      return mapResult(row);
    },

    async updateMany({
      where,
      data,
      ...opts
    }: Record<string, unknown> & {
      where?: Record<string, unknown>;
      data: Record<string, unknown>;
    }) {
      return (prisma.user as any).updateMany({
        where: transformWhere(where),
        data,
        ...opts,
      });
    },

    async delete({
      where,
      ...opts
    }: Record<string, unknown> & { where: Record<string, unknown> }) {
      return (prisma.user as any).delete({
        where: transformWhere(where),
        ...opts,
      });
    },

    async deleteMany({
      where,
      ...opts
    }: Record<string, unknown> & { where?: Record<string, unknown> }) {
      return (prisma.user as any).deleteMany({
        where: transformWhere(where),
        ...opts,
      });
    },

    async count({
      where,
      ...opts
    }: Record<string, unknown> & { where?: Record<string, unknown> }) {
      return (prisma.user as any).count({
        where: transformWhere(where),
        ...opts,
      });
    },
  };

  return new Proxy(prisma, {
    get(target, prop) {
      if (prop === 'user') return userProxy;
      return (target as unknown as Record<string | symbol, unknown>)[
        prop as string
      ];
    },
  });
}

export function createAuth(
  prisma: PrismaService,
  userService: UsersService,
  sendMagicLink: SendMagicLinkFn,
  sendResetPassword: SendResetPasswordFn,
  databaseHooks?: BetterAuthOptions['databaseHooks'],
) {
  const proxiedPrisma = buildBaUserProxy(prisma, userService);

  return betterAuth({
    database: prismaAdapter(proxiedPrisma as any, { provider: 'postgresql' }),

    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',

    // Better Auth's user table IS our existing User model.
    // `name`  maps to User.firstName (best approximation without a schema change)
    // `image` maps to User.profileImage
    user: {
      fields: {
        name: 'firstName',
        image: 'profileImage',
      },
      // Expose the password column so it survives the adapter's transformInput
      // when we need to set a placeholder for passwordless sign-ups.
      additionalFields: {
        password: {
          type: 'string',
          required: false,
          returned: false,
          fieldName: 'password',
        },
      },
    },

    session: {
      modelName: 'baSession',
    },

    account: {
      modelName: 'baAccount',
    },

    verification: {
      modelName: 'baVerification',
    },

    // -----------------------------------------------------------------------
    // Password auth — enabled for existing users
    // -----------------------------------------------------------------------
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async (data) => {
        await sendResetPassword(data);
      },
      password: {
        // New passwords use bcrypt (10 rounds) to stay consistent with the
        // existing hash format used throughout the application.
        hash: (password: string) => bcrypt.hash(password, 10),
        // Verify bcrypt hashes (existing users) and fall through for scrypt
        // (Better Auth's default for accounts created post-migration).
        verify: async ({
          hash,
          password,
        }: {
          hash: string;
          password: string;
        }) => {
          if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
            return bcrypt.compare(password, hash);
          }
          // Unrecognised hash format — deny access
          return false;
        },
      },
    },

    // -----------------------------------------------------------------------
    // Magic link
    // disableSignUp keeps Better Auth from trying to INSERT a new User row
    // (which would fail because several User columns have no default value).
    // Only existing users can request a magic link until the full migration is
    // complete and the User schema is relaxed.
    // -----------------------------------------------------------------------
    plugins: [
      magicLink({
        sendMagicLink: async (data) => {
          await sendMagicLink(data);
        },
        disableSignUp: true,
      }),
    ],

    databaseHooks,

    trustedOrigins: [process.env.FRONT_END_URL ?? 'http://localhost:5173'],

    advanced: {
      cookiePrefix: 'cf',
      crossSubdomainCookies: {
        enabled: true,
        domain: 'mycareerfingerprint.com', // leading dot covers all subdomains
      },
    },

    rateLimit: {
      enabled: false, // Disables rate limiting entirely
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
