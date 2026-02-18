# Contributing to Basefly

Thank you for your interest in contributing to Basefly! This document provides guidelines and instructions for contributing.

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

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later)
- [pnpm](https://pnpm.io/) (v9.x or later)
- [PostgreSQL](https://www.postgresql.org/) (v15.x or later)
- [Git](https://git-scm.com/)

### Getting Started

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/basefly.git
   cd basefly
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure the required environment variables (see `.env.example` for details).

4. **Set up the database**

   ```bash
   pnpm db:push
   ```

5. **Start the development server**

   ```bash
   pnpm dev:web
   ```

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Avoid `any` type - use proper type definitions
- Use `interface` for object shapes, `type` for unions/intersections
- Prefer `const` assertions for literal types

### Code Formatting

- Run `pnpm format` before committing
- Prettier configuration is enforced via CI
- Use meaningful variable and function names

### Component Structure

- Follow the existing component patterns in `packages/ui`
- Use shadcn/ui components as building blocks
- Implement proper TypeScript types for props

### API Development

- Use tRPC for all API endpoints
- Implement proper input validation with Zod
- Follow existing router patterns in `packages/api`

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for API routes
- Use Vitest as the testing framework
- Aim for meaningful test coverage, not just percentage

## Commit Guidelines

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples

```
feat(auth): add OAuth2 login support
fix(api): resolve race condition in webhook handler
docs(readme): update installation instructions
```

## Recommended Pull Request Guideline

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

## Need Help?

- Join our [Discord](https://discord.gg/8SwSX43wnD) for discussions
- Check [existing issues](https://github.com/basefly/basefly/issues)
- Email [contact@nextify.ltd](mailto:contact@nextify.ltd) for questions
