# Security Audit: Error Logging for Sensitive Data Leakage

**Evaluation Date**: 2026-08-02
**Issue**: #632 — [Security] Audit error logging for sensitive data leakage
**Scope**: All `logger.*` / `console.*` call sites across `packages/` and `apps/nextjs/src`
**Verdict**: **PASS** — no PII, API keys, tokens, or credentials were found in log output. Layered redaction controls are present and effective. Regression test added to prevent future regressions.

---

## 1. Domain Score Table

| Domain         | Criterion          | Score      | Notes                                                                                                                                |
| -------------- | ------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| System Quality | Security Practices | **90/100** | No leaks found; defense-in-depth redaction present. -10 for residual risk: redaction relies on key-name matching (documented in §6). |
| Code Quality   | Error Handling     | **90/100** | Errors are logged as sanitized messages or through `safeSerializeError`; raw error objects never reach output.                       |

---

## 2. Methodology

1. Inventoried every `logger.info/warn/error/debug` and `console.*` call in non-test source across `packages/api`, `packages/stripe`, `packages/db`, `packages/common`, `packages/ui`, and `apps/nextjs/src`.
2. Inspected the centralized logger implementation and its redaction layers.
3. Verified each log call's payload for sensitive field names (secret, token, password, credential, api_key, authorization, cookie, session, private_key, header, signature) and PII (emails, raw user objects).
4. Verified error paths (tRPC error formatter, webhook handlers, Stripe/Clerk error propagation) for raw error-object leakage.
5. Added a regression test asserting redaction behavior.

---

## 3. Evidence: Redaction Controls (Defense in Depth)

All loggers derive from `packages/common/src/logger.ts`, which implements **four** independent layers:

| Layer                      | Implementation                                                                                                                                                       | Evidence                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1. Pino `redact` config    | `buildRedactConfig()` generates top-level, `*.field`, and `**.field` paths for every sensitive pattern; censor = `[REDACTED]`                                        | `packages/common/src/logger.ts:179-190` |
| 2. Error serializer        | `safeSerializeError()` recursively sanitizes nested error properties (max depth 5), stripping raw `headers`, `config`, and other sensitive sub-objects before output | `packages/common/src/logger.ts:93-168`  |
| 3. Wrapper-level redaction | `redactSensitiveFields()` case-insensitively redacts metadata keys before any log emission                                                                           | `packages/common/src/logger.ts:281-293` |
| 4. Sensitive pattern list  | `SENSITIVE_FIELD_PATTERNS` (15 patterns incl. `header`, `signature`, `cookie`, `session`, `api_key`, `apikey`)                                                       | `packages/common/src/logger.ts:57-76`   |

The Stripe and app loggers both wrap this shared instance (`packages/stripe/src/logger.ts`, `apps/nextjs/src/lib/logger.ts`), so no package bypasses redaction.

---

## 4. Evidence per Call Site Category

### 4.1 API routers (`packages/api/src/router/*`)

- All `logger.error()` calls log only `error: error instanceof Error ? error.message : String(error)` — a **sanitized message string**, never the raw error object.
- Evidence:
  - `packages/api/src/router/k8s.ts:142,214,273` — `{ userId, requestId, error: <message> }`
  - `packages/api/src/router/customer.ts:86,153,205` — same pattern
  - `packages/api/src/router/auth.ts:52` — same pattern
  - `packages/api/src/router/hello.ts:92` — same pattern
- `logger.info/warn` calls carry only non-sensitive context: `userId`, `requestId`, `clusterId`, `resourceType`, `resourceId`. These are identifiers required for audit trail, not credentials or PII payloads.
- `packages/api/src/authorization.ts:41,56` — logs `reason`, `resourceType`, `resourceId` on authz denials; no sensitive data.

### 4.2 tRPC error formatter (`packages/api/src/trpc.ts:65-75`)

- The error formatter exposes only `shape` + `zodError` + `requestId` to clients. Raw error `cause` / `details` are **not** propagated to the client.
- Server-side logging of these errors goes through the routers' sanitized pattern above.

### 4.3 Stripe package (`packages/stripe/src/*`)

- `client.ts:89,108,150,174` — logs `requestId`, `customerId`, `idempotencyKey`. No API keys, no raw Stripe responses.
- `webhooks.ts:58,61,63,120,154` — logs event types and sanitized messages only.
- `webhook-idempotency.ts:22,46,96,162,204` — logs `eventId`, `eventType`, `retentionDays` + sanitized error messages. Raw `error` passed to logger is handled by `safeSerializeError` (redacts any nested `headers`/`signature`/`secret`).
- `packages/stripe/src/logger.ts` — re-exports shared redacting logger.
- **Previously fixed**: `apps/nextjs/src/app/api/webhooks/stripe/route.ts:150-159` deliberately never passes the raw `StripeError` object to the logger (its `headers` property can contain the Stripe-Signature value). A dedicated try/catch extracts only `error.message`. (Commit `9c20a29`, PR #1001.)

### 4.4 Database package (`packages/db/src/*`)

- `user-deletion.ts:95,146,217`, `soft-delete.ts:103,149,269`, `rls-middleware.ts:64` — log `requestId`, `userId`, `table`, and sanitized error messages only.

### 4.5 Next.js app (`apps/nextjs/src/**`)

- `proxy.ts:211-227` — slow-request logging carries `method`, `url` (**pathname only** — `req.nextUrl.pathname`, no query string), `duration`, `requestId`. No cookies, no headers, no auth tokens.
- `trpc/client.ts:20`, `trpc/server.ts:41,66,97` — client-side error normalization; `TRPCClientError.from(cause)` keeps only the sanitized server shape.
- `lib/health-check.ts` — no logger calls emit request/user data.
- `lib/logger.ts` — shared redacting logger; production level defaults to `error`, suppressing debug/info/warn verbosity.

### 4.6 `console.*` usage

- Every `console.*` occurrence in non-test source is inside **JSDoc comments** (documentation examples), not executable code:
  - `packages/common/src/config/project.ts:16,19` (comments)
  - `packages/stripe/src/client.ts:189-190`, `integration.ts:77,276` (comments)
  - `packages/ui/src/copy-button.tsx:96-97` (comments)
  - `packages/db/user-deletion.ts:33,167-169`, `soft-delete.ts:290,319` (comments)
  - `apps/nextjs/cloudflare-env.d.ts:136-221` (type declaration docs)
  - `apps/nextjs/src/lib/get-dictionary.ts:87` (comment)
- Real `console.*` exists only in CLI tooling (`tooling/qa/env-validate.js`, `tooling/qa/validate-ci-workflows.js`) where stdout is the intended output channel — no secrets involved.

### 4.7 Environment variables

- `packages/common/src/config/env.ts:107-132` — `validateEnvVars()` reports only **variable names** in `missing`/`missingRecommended` lists. **Values are never logged.**
- `initEnvValidation()` (`env.ts:170-184`) logs `[env-validation] Missing required environment variables: CLERK_SECRET_KEY, ...` — names only.

---

## 5. Findings Fixed During Audit

During the inventory, one redaction gap was identified and fixed:

| Finding                             | Evidence                                                                                                                                                                                                                                                                                                                                                 | Fix                                                                                                                                                                  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **camelCase `apiKey` not redacted** | `SENSITIVE_FIELD_PATTERNS` contained `api_key` (snake*case) but not `apikey`. The redaction matcher lowercases the metadata key and does a substring match — `"apikey".includes("api_key")` is `false`, so a payload logged as `{ apiKey: "sk_live*..." }` (the exact casing used by the Stripe SDK client config) would have passed through unredacted. | Added `"apikey"` to `SENSITIVE_FIELD_PATTERNS` (`packages/common/src/logger.ts`), matching the existing dual-listing convention used for `private_key`/`privatekey`. |

## 6. Regression Test Added

**File**: `packages/common/src/logger.test.ts`

New test block `logger.ts - Sensitive data redaction (issue #632)` verifies:

1. `safeSerializeError` redacts top-level sensitive keys (`apiKey`, `token`, `secret`).
2. `safeSerializeError` redacts **deeply nested** sensitive keys (simulating StripeError with `headers` containing a signature).
3. Raw StripeError-style objects never leak signature values through the serializer.
4. Sanitized error `message` strings pass through unchanged.
5. `createLoggerWrapper` redacts case-insensitive metadata variants (`API_KEY`, `Authorization`) **before emission** (verified against a mocked pino logger).
6. `createLoggerWrapper` redacts nested secrets in error metadata (`stripeSecret`) before emission.

These tests guard against future regressions where a new log call site accidentally passes sensitive payloads.

---

## 7. Residual Risk (accepted, not blocking)

| Risk                                      | Rationale                                                                                                                   | Mitigation                                                                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Redaction is key-name-based               | A payload whose sensitive value is stored under an unsanitized key (e.g., `{ data: "sk_live_..." }`) would not be redacted. | Engineering standard: log only sanitized values (`error.message`); never log raw objects. Enforced by code review + this audit's inventory. |
| Error message strings could embed secrets | If an upstream service embeds a secret into `error.message`, message-string logging would surface it.                       | Stripe path already extracts only `error.message`; `IntegrationError` sanitizes messages (`packages/stripe/src/integration.ts`).            |
| Query strings on slow-request logs        | Currently only `pathname` is logged (no query string), but future changes must not add `req.nextUrl.search` or `req.url`.   | Flagged in this report; covered by redaction test patterns.                                                                                 |

---

## 8. Files Affected

| File                                 | Change                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `packages/common/src/logger.ts`      | Added `apikey` to `SENSITIVE_FIELD_PATTERNS` (closes camelCase redaction gap) |
| `packages/common/src/logger.test.ts` | Added redaction regression tests                                              |
| `docs/security-logging-audit.md`     | This audit report (new)                                                       |

---

## 9. Conclusion

All acceptance criteria for #632 are met:

- [x] All logger calls audited (inventory in §4)
- [x] No PII in logs (no emails, raw user objects, or personal data found)
- [x] No API keys/tokens in logs (verified across all packages; webhook secret leak previously fixed in #1001; camelCase `apiKey` redaction gap fixed this audit)
- [x] Test added to prevent regressions (§6)
