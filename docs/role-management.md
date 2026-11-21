# Role Management (RBAC)

How Basefly assigns, checks, and audits user roles. Implements the role-based
access control part of issue [#498](https://github.com/cpa03/basefly/issues/498)
([P1][Security] Replace email-based admin RBAC with role-based access control).

## Model

Roles live on the `User` table (Prisma, `packages/db/prisma/schema.prisma`):

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  // ...
  role Role @default(USER)
}
```

Every new user starts as `USER`. There is no self-service role elevation;
an operator promotes a user directly in the database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE id = '<user-id>';
```

Or with Prisma Studio: `pnpm db:studio`.

## Enforcement

Two middlewares in `packages/api/src/trpc.ts`:

| Middleware                   | Source of truth                          | Use for                   |
| ---------------------------- | ---------------------------------------- | ------------------------- |
| `requireRole(role)`          | `User.role` (database)                   | New role-gated procedures |
| `adminProcedure` / `isAdmin` | `User.role`, falls back to `ADMIN_EMAIL` | Legacy admin routes       |

```ts
// Role-gated procedure (recommended)
const adminProcedure = createRoleBasedProcedure(Role.ADMIN);

export const adminRouter = createTRPCRouter({
  getStats: adminProcedure.query(async () => {
    /* ... */
  }),
});
```

`requireRole` performs the role lookup inside an RLS transaction
(`rlsTransaction`), so the check and the request run against a consistent
database state.

### Migration path from email allowlist

`isAdmin` checks `User.role` first. If the database lookup fails or the role
is not `ADMIN`, it falls back to the `ADMIN_EMAIL` environment variable so
existing deployments keep working during migration:

1. Keep `ADMIN_EMAIL` configured (legacy admins continue to pass).
2. Promote each legacy admin to `role = 'ADMIN'` in the database.
3. Remove `ADMIN_EMAIL` once no rows depend on it.

## Audit events

Role decisions emit structured audit logs (pino, `security: true`,
`audit: true`) with `requestId` and `userId`:

| `action`               | Level | Meaning                                                              |
| ---------------------- | ----- | -------------------------------------------------------------------- |
| `admin_access_granted` | info  | Admin route allowed (`method`: `database_role` or `email_migration`) |
| `admin_access_denied`  | warn  | Admin route rejected (`reason: not_admin`)                           |
| `role_access_granted`  | info  | `requireRole` allowed the request                                    |
| `role_access_denied`   | warn  | `requireRole` rejected the request (`reason: insufficient_role`)     |

Denied events are part of the audit trail: they record who attempted a
privileged action and which role was required.

## Testing

`packages/api/src/rbac.test.ts` exercises the middleware chain end to end with
a mocked database: grant, denial, authentication failure, and audit payloads.
Run it with the rest of the suite:

```bash
pnpm test
```
