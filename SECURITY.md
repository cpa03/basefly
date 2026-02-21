# Security Policy

## Reporting a Vulnerability

We greatly value the security community's efforts in helping keep our project safe. If you've discovered a security vulnerability, your responsible disclosure is crucial to us. Here's how you can report it:

1. **Contact Method**: Please send an email to [contact@nextify.ltd](mailto:contact@nextify.ltd).
2. **Email Subject**: Please use a concise yet descriptive subject, such as "Security Vulnerability Discovered".
3. **Vulnerability Details**: Provide a comprehensive description of the vulnerability. Include reproduction steps and any other information that might help us effectively understand and resolve the issue.
4. **Proof of Concept**: If possible, please attach any proof of concept or sample code. Please ensure that your research does not involve destructive testing or violate any laws.
5. **Response Time**: We will acknowledge receipt of your report within 24 hours and will keep you informed of our progress.
6. **Investigation and Remediation**: Our team will promptly investigate and work on resolving the issue. We will maintain communication with you throughout the process.
7. **Disclosure Policy**: Please refrain from public disclosure until we have mitigated the vulnerability. We will collaborate with you to determine an appropriate disclosure timeline based on the severity of the issue.

We appreciate your contributions to the security of our project. Contributors who help improve our security may be publicly acknowledged (with consent).

Note: Our security policy may be updated periodically.

## Supported Versions

The following versions of Basefly are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Severity Levels and Response SLAs

We categorize security vulnerabilities using the following severity levels and commit to these response times:

| Severity | Acknowledgment | Initial Assessment | Remediation Target |
| -------- | -------------- | ------------------ | ------------------ |
| Critical | 24 hours       | 48 hours           | 7 days             |
| High     | 48 hours       | 5 days             | 14 days            |
| Medium   | 5 days         | 10 days            | 30 days            |
| Low      | 10 days        | 14 days            | 60 days            |

**Severity Classification:**
- **Critical**: Remote code execution, authentication bypass, data breach
- **High**: Privilege escalation, significant data exposure
- **Medium**: Limited data exposure, CSRF, XSS with user interaction
- **Low**: Minor information disclosure, best practice violations

## Vulnerability Report Template

When reporting a vulnerability, please include the following information:

```markdown
**Vulnerability Summary:**
[ Brief description of the vulnerability ]

**Affected Component:**
[ e.g., API endpoint, authentication module, specific file ]

**Basefly Version:**
[ Version number where the vulnerability was found ]

**Steps to Reproduce:**
1. [ Step 1 ]
2. [ Step 2 ]
3. [ Step 3 ]

**Proof of Concept:**
[ Code snippet, screenshot, or detailed instructions ]

**Potential Impact:**
[ What an attacker could achieve ]

**Suggested Mitigation:**
[ Optional: Your recommendations for fixing the issue ]

**Environment:**
- OS: [ e.g., Ubuntu 22.04 ]
- Browser: [ e.g., Chrome 120 ]
- Node.js version: [ e.g., 20.10.0 ]
```

## Safe Harbor

We support responsible security research. We will not pursue legal action against security researchers who:
- Act in good faith to identify and report vulnerabilities
- Avoid privacy violations, data destruction, and service interruptions
- Do not access or modify data that is not their own
- Provide us with reasonable time to remediate before disclosure