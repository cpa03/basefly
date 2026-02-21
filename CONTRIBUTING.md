## Developer Experience (DX) Onboarding

Welcome, new contributor! This section helps you get up to speed quickly.

### Quick Start Checklist

1. **Prerequisites**
   - [Node.js 18+](https://nodejs.org/) installed
   - [pnpm](https://pnpm.io/) installed (`npm install -g pnpm`)
   - [PostgreSQL](https://www.postgresql.org/) (local or remote)

2. **Initial Setup**

   ```bash
   # Clone and install dependencies
   git clone https://github.com/cpa03/basefly.git
   cd basefly
   pnpm install

   # Verify your environment
   pnpm dx:setup

   # Copy environment variables
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Daily Development Commands**

   ```bash
   pnpm dev          # Start development server
   pnpm build        # Build for production
   pnpm lint         # Check code style
   pnpm test         # Run tests
   pnpm typecheck    # Type check
   ```

4. **DX Convenience Scripts**

   ```bash
   pnpm dx:quick     # Fast feedback: typecheck + lint only
   pnpm dx:check     # Run typecheck + lint + test + security audit
   pnpm dx:fix       # Auto-fix lint and format issues
   pnpm dx:deps      # Check outdated dependencies and run audit
   pnpm dx:setup     # Verify development environment
   pnpm dx:all       # Run all DX checks comprehensively
   pnpm dx:ci        # Simulate CI: dx:check + build
   ```

5. **Before Submitting a PR**

   ```bash
   # Run comprehensive checks
   pnpm dx:all

   # Or step by step:
   pnpm typecheck && pnpm lint && pnpm test
   ```

### Project Structure

```
apps/nextjs/       # Main Next.js application
packages/api/      # tRPC API definitions
packages/db/       # Prisma schema and migrations
packages/ui/       # Shared UI components
tooling/           # Shared configs (ESLint, Prettier, TS)
```

### Useful Links

- [README.md](./README.md) - Getting started guide
- [AGENTS.md](./AGENTS.md) - AI agent configuration
- [docs/](./docs/) - Additional documentation

### Troubleshooting

#### Common Issues

**Lockfile Issues**

```bash
# Regenerate lockfile if corrupted
rm pnpm-lock.yaml && pnpm install
```

**Cache Issues**

```bash
# Clear all caches and reinstall
pnpm reset
```

**Type Errors**

```bash
# Regenerate Prisma client
pnpm db:generate
```

**Build Failures**

```bash
# Clean and rebuild
pnpm clean:all && pnpm install && pnpm build
```

#### Quick Diagnostics

```bash
# Fast feedback (typecheck + lint only)
pnpm dx:quick

# Full CI simulation
pnpm dx:ci
```

---

## Can I create a pull request for Basefly?

Yes or no, it depends on what you will try to do. Since I don't want to waste your time, be sure to **create an empty draft pull request or open an issue, so we can have a discussion first**. Especially for a large pull request or you don't know if it will be merged or not.

Here are some references:

### ✅ Usually accepted

- Bug fix
- Security fix
- Adding notification providers
- Adding new language keys

### ⚠️ Discussion required

- Large pull requests
- New features

### ❌ Won't be merged

- Do not pass the automated tests
- Any breaking changes
- Duplicated pull requests
- Buggy
- UI/UX is not close to Basefly
- Modifications or deletions of existing logic without a valid reason.
- Adding functions that is completely out of scope
- Converting existing code into other programming languages
- Unnecessarily large code changes that are hard to review and cause conflicts with other PRs.

The above cases may not cover all possible situations.

If your pull request does not meet my expectations, I will reject it, no matter how much time you spent on it. Therefore, it is essential to have a discussion beforehand.

I will assign your pull request to a [milestone](https://github.com/cpa03/basefly/milestones), if I plan to review and merge it.

Also, please don't rush or ask for an ETA, because I have to understand the pull request, make sure it is no breaking changes and stick to my vision of this project, especially for large pull requests.

### Recommended Pull Request Guideline

Before deep into coding, discussion first is preferred. Creating an empty pull request for discussion would be recommended.

1. Fork the project
2. Clone your fork repo to local
3. Create a new branch
4. Create an empty commit: `git commit -m "<YOUR TASK NAME>" --allow-empty`
5. Push to your fork repo
6. Prepare a pull request: https://github.com/cpa03/basefly/compare
7. Write a proper description. You can mention @tianzx in it, so @tianzx will get the notification.
8. Create your pull request as a Draft
9. Wait for the discussion

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contact@nextify.ltd](mailto:contact@nextify.ltd).

---

## Git Workflow

### Branch Naming Conventions

Use descriptive branch names with the following prefixes:

| Prefix    | Purpose                          | Example                    |
| --------- | -------------------------------- | -------------------------- |
| `feat/`   | New features                     | `feat/cluster-monitoring`  |
| `fix/`    | Bug fixes                        | `fix/auth-validation`      |
| `docs/`   | Documentation improvements       | `docs/api-reference`       |
| `refactor/` | Code refactoring (no new features) | `refactor/user-service` |
| `test/`   | Adding or updating tests         | `test/subscription-flow`   |
| `chore/`  | Maintenance tasks                | `chore/update-dependencies`|
| `security/` | Security-related changes       | `security/input-validation`|

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should be structured as:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `security`: Security improvements

**Examples:**

```bash
feat(api): add cluster health check endpoint
fix(auth): resolve token refresh race condition
docs(readme): update installation instructions
security(api): add rate limiting to public endpoints
```

### Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Branch follows naming conventions
- [ ] Commits follow conventional commit format
- [ ] All tests pass (`pnpm test`)
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] Code style is consistent (`pnpm lint`)
- [ ] Documentation updated if needed
- [ ] PR description clearly explains the changes

---

## Reporting Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

For security-related concerns, please follow our [Security Policy](./SECURITY.md) and report vulnerabilities to [contact@nextify.ltd](mailto:contact@nextify.ltd).

---

## Additional Resources

- [API Specification](./docs/api-spec.md) - API endpoints and error handling
- [Development Guide](./docs/DEVELOPMENT.md) - Detailed setup instructions
- [CI/CD Documentation](./docs/ci-cd.md) - Build and deployment workflows
- [Security Policy](./SECURITY.md) - Vulnerability reporting and security guidelines
