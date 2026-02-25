# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

Basefly implements multiple layers of security:

- **Authentication**: Clerk-based authentication with session management
- **Authorization**: Role-based access control (RBAC) for admin features
- **Rate Limiting**: Token bucket algorithm (100 req/min read, 20 req/min write)
- **Input Validation**: Zod schemas at API boundaries
- **Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **Webhook Verification**: Stripe webhook signature verification
- **Circuit Breakers**: Protection against cascading failures
- **Soft Delete**: Audit trail preservation for data integrity

## Reporting a Vulnerability

We greatly value the security community's efforts in helping keep our project safe. If you've discovered a security vulnerability, your responsible disclosure is crucial to us. Here's how you can report it:

1. **Contact Method**: Please send an email to [contact@nextify.ltd](mailto:contact@nextify.ltd).
2. **Email Subject**: Please use a concise yet descriptive subject, such as "Security Vulnerability Discovered".
3. **Vulnerability Details**: Provide a comprehensive description of the vulnerability. Include reproduction steps and any other information that might help us effectively understand and resolve the issue.
4. **Proof of Concept**: If possible, please attach any proof of concept or sample code. Please ensure that your research does not involve destructive testing or violate any laws.
5. **Response Time**: We will acknowledge receipt of your report within 24 hours and will keep you informed of our progress.
6. **Investigation and Remediation**: Our team will promptly investigate and work on resolving the issue. We will maintain communication with you throughout the process.
7. **Disclosure Policy**: Please refrain from public disclosure until we have mitigated the vulnerability. We will collaborate with you to determine an appropriate disclosure timeline based on the severity of the issue.

## Severity Levels and Response SLAs

| Severity | Description                                 | Initial Response | Resolution Target |
| -------- | ------------------------------------------- | ---------------- | ----------------- |
| Critical | Remote code execution, data breach          | 24 hours         | 72 hours          |
| High     | Authentication bypass, privilege escalation | 48 hours         | 7 days            |
| Medium   | Cross-site scripting, CSRF                  | 72 hours         | 14 days           |
| Low      | Information disclosure, minor issues        | 1 week           | 30 days           |

## Vulnerability Report Template

When reporting a vulnerability, please include:

```
**Summary**: Brief description of the vulnerability

**Severity**: Critical / High / Medium / Low

**Affected Component**: File path or feature affected

**Description**: Detailed explanation of the vulnerability

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. ...

**Proof of Concept**: Code or commands to demonstrate the issue

**Suggested Fix**: If you have ideas for remediation

**Impact**: Potential damage if exploited
```

## Safe Harbor

We support responsible security research. We will not pursue legal action against security researchers who:

- Act in good faith to identify and report vulnerabilities
- Avoid accessing, modifying, or deleting data that is not theirs
- Do not degrade system performance or availability
- Provide reasonable time for remediation before disclosure

We appreciate your contributions to the security of our project. Contributors who help improve our security may be publicly acknowledged (with consent).

---

**Note**: Our security policy may be updated periodically. For implementation details, see [docs/api-spec.md](./docs/api-spec.md) for security patterns and [docs/ci-cd.md](./docs/ci-cd.md) for CI security configuration.
