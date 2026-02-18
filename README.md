
<div align="center" width="100%">
    <img src="./saasfly-logo.svg" width="128" alt="" />
</div>

# Basefly </br>
<a href="https://trendshift.io/repositories/8929" target="_blank"><img src="https://trendshift.io/api/badge/repositories/8929" alt="basefly%2Fbasefly | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

[![GitHub Actions Workflow Status][check-workflow-badge]][check-workflow-badge-link] [![GitHub License][github-license-badge]][github-license-badge-link]  [![Discord][discord-badge]][discord-badge-link] [![Saasfly][made-by-nextify-badge]][made-by-nextify-badge-link]
[![Chinese](https://img.shields.io/badge/-Chinese-red.svg)](README_zh.md)
[![German](https://img.shields.io/badge/-German-yellow.svg)](README_de.md)
[![Vietnamese](https://img.shields.io/badge/-Vietnamese-yellow.svg)](README_vi.md) </br>
![COMMIT_ACTIVITY](https://img.shields.io/github/commit-activity/m/basefly/basefly?style=for-the-badge)
[![Visitors](https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Fcpa03%2Fbasefly&labelColor=%23f47373&countColor=%23263759)](https://visitorbadge.io/status?path=https%3A%2F%2Fgithub.com%2Fcpa03%2Fbasefly)

An enterprise-grade Kubernetes cluster management platform.

Basefly simplifies Kubernetes cluster deployment and management with a modern web interface, subscription-based access tiers, and integrated billing through Stripe.

> **[Nextify](https://nextify.ltd)** provides a complete Enterprise SaaS solution. Contact us at [contact@nextify.ltd](mailto:contact@nextify.ltd) if you're interested in discussing your project, or if you'd simply like to have a conversation with us, please feel free to reach out.

> ❤️ We provide **free technical support and deployment services to non-profit organizations**.
>
> 🙌 All profits obtained from our open source projects will be **entirely dedicated to supporting open source initiatives and charitable causes**.

## ⚡ Live Demo

Try it out for yourself!

Demo Server (Location: Washington - USA): <https://show.saasfly.io>

See more documentation at <https://document.saasfly.io>

## 🌟 Star History

[![Star History Chart](https://app.repohistory.com/api/svg?repo=cpa03/basefly&type=Timeline)](https://repohistory.com)

## Sponsors

<table>
  <tr>
   <td style="width: 64px;">
      <a href="https://libra.dev/">
        <div style="width: 64px;">
          <img alt="Clerk" src="https://raw.githubusercontent.com/nextify-limited/libra/main/logo.svg">
        </div>
      </a>
    </td>
    <td style="width: 64px;">
      <a href="https://go.clerk.com/uKDp7Au">
        <div style="width: 64px;">
          <img alt="Clerk" src="./clerk.png">
        </div>
      </a>
    </td>
    <td style="width: 64px;">
      <a href="https://www.twillot.com/">
        <div style="width: 64px;">
          <img alt="Take Control of All Your Twitter Assets" src="./twillot.png">
        </div>
      </a>
    </td>
    <td style="width: 64px;">
      <a href="https://www.setupyourpay.com/" title="如何注册美国公司进行收款">
        <div style="width: 64px;">
          <img alt="全球收款手册" src="./setupyourpay.png">
        </div>
      </a>
    </td>
  </tr>
</table>

<a href="mailto:contact@nextify.ltd">
  Add your logo here
</a>

## 🚀 Getting Started

### 🖱 One Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbasefly%2Fbasefly&env=NEXT_PUBLIC_APP_URL,CLERK_SECRET_KEY,CLERK_PUBLISHABLE_KEY,STRIPE_API_KEY,STRIPE_WEBHOOK_SECRET,POSTGRES_URL,RESEND_API_KEY,RESEND_FROM,ADMIN_EMAIL,NEXT_PUBLIC_STRIPE_STD_PRODUCT_ID,NEXT_PUBLIC_STRIPE_STD_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID,NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID,NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID&install-command=pnpm%20install&build-command=pnpm%20run%20build&root-directory=apps%2Fnextjs)

### 📋 Prerequisites

Before you start, make sure you have the following installed:

1. [pnpm](https://pnpm.io/) & [Node.js](https://nodejs.org/) & [Git](https://git-scm.com/)

   1. Linux

    ```bash
      curl -fsSL https://get.pnpm.io/install.sh | sh -
    ```

   2. MacOS

    ```bash
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
      brew install git
      brew install pnpm
    ```

2. [PostgreSQL](https://www.postgresql.org/) - Required for cluster configuration and user data
   1. You can use Vercel Postgres or a local PostgreSQL server (add POSTGRES_URL env in .env.local)
      ```bash
         POSTGRES_URL = ''
      ```

3. [Clerk](https://clerk.com/) account - For authentication
   1. Create a Clerk account and get API keys
   2. Add Clerk application with Next.js configuration

4. [Stripe](https://stripe.com/) account - For subscription billing
   1. Create a Stripe account
   2. Get API keys and set up webhook endpoint

### Installation

To get started with this boilerplate, we offer two options:

1. Use the `pnpm create` command(🌟Strongly recommend🌟):

```bash
pnpm create basefly 
```

2. Manually clone the repository:

```bash
git clone https://github.com/cpa03/basefly.git
cd basefly
pnpm install
```

### Setup

Follow these steps to set up your project:

1. Set up the environment variables:

```bash
cp .env.example .env.local
# Configure required environment variables (see .env.example for details)
# Required: Clerk keys, Stripe keys, PostgreSQL URL, Resend API key
pnpm db:push
```

2. Run the development server:

```bash
pnpm run dev:web
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

4. (Optional alpha) `pnpm run tailwind-config-viewer` Open [http://localhost:3333](http://localhost:3333) in your browser to see your Tailwind CSS configuration

5. Access the admin dashboard at `/admin/dashboard` using email addresses configured in `ADMIN_EMAIL` environment variable.

## 🎯 Key Features

### Kubernetes Cluster Management
- Create and manage Kubernetes clusters through a web interface
- Multiple subscription tiers (FREE, PRO, BUSINESS) with different resource limits
- Cluster status tracking (PENDING, CREATING, INITING, RUNNING, STOPPED)
- Soft delete support for cluster preservation

### Subscription & Billing
- Integrated Stripe subscription billing
- Multiple pricing plans with automatic provisioning
- Webhook-based subscription status synchronization
- Customer portal for subscription management

### Enterprise Features
- Multi-language support (English, Chinese, German, Vietnamese)
- Role-based access control (Admin dashboard)
- Audit trail preservation with soft delete patterns
- Type-safe API with tRPC
- Comprehensive error handling with retry logic

## 🥺 Project Roadmap

1. Enhanced Admin Dashboard
    1. Currently in alpha - provides basic administrative views
    2. Configure admin emails in `ADMIN_EMAIL` environment variable
    3. Access at `/admin/dashboard`
    4. Security: No online admin demos available

2. Advanced Kubernetes Features
    1. Cluster monitoring and metrics integration
    2. Node pool management
    3. Auto-scaling configuration

3. Additional Integrations
    1. Consider integrating Payload CMS for content management
    2. Enhanced notification system
    3. Usage analytics and reporting

## ⭐ Features

### 🐭 Frameworks & Core

- **[Next.js](https://nextjs.org/)** - The React Framework for the Web (with **App Directory**)
- **[Clerk](https://clerk.com/)** - Complete user management and authentication platform
- **[Kysely](https://kysely.dev/)** - Type-safe SQL query builder for TypeScript
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM for Node.js and TypeScript, used as a schema management tool
- **[React-email](https://react.email/)** - A React renderer for creating beautiful emails using React components

### 🐮 Platforms & Integrations

- **[Clerk](https://go.clerk.com/uKDp7Au)** - Complete user authentication and management
- **[Vercel](https://vercel.com/)** – Deploy your Next.js app with ease
- **[Stripe](https://stripe.com/)** – Payment processing and subscription billing
- **[Resend](https://resend.com/)** – Email marketing platform for transactional emails

### 🐯 Enterprise Features

- **[i18n](https://nextjs.org/docs/app/building-your-application/routing/internationalization)** - Support for internationalization
- **[SEO](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)** - Search engine optimization
- **[MonoRepo](https://turbo.build/)** - Monorepo for better code management
- **[T3 Env](https://env.t3.gg/)** - Manage your environment variables with ease

### 🐰 Data Fetching

- **[trpc](https://trpc.io/)** – End-to-end typesafe APIs made easy
- **[tanstack/react-query](https://react-query.tanstack.com/)** – Hooks for fetching, caching and updating asynchronous data in React

### 🐲 Global State Management

- **[Zustand](https://zustand.surge.sh/)** – Small, fast and scalable state management for React

### 🐒 UI

- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS framework for rapid UI development
- **[Shadcn/ui](https://ui.shadcn.com/)** – Re-usable components built using Radix UI and Tailwind CSS
- **[Framer Motion](https://framer.com/motion)** – Motion library for React to animate components with ease
- **[Lucide](https://lucide.dev/)** – Beautifully simple, pixel-perfect icons
- **[next/font](https://nextjs.org/docs/basic-features/font-optimization)** – Optimize custom fonts and remove external network requests for improved performance

### 🐴 Code Quality

- **[TypeScript](https://www.typescriptlang.org/)** – Static type checker for end-to-end type safety
- **[Prettier](https://prettier.io/)** – Opinionated code formatter for consistent code style
- **[ESLint](https://eslint.org/)** – Pluggable linter for Next.js and TypeScript
- **[Husky](https://typicode.github.io/husky)** – Git hooks made easy

### 🐑 Performance

- **[Vercel Analytics](https://vercel.com/analytics)** – Real-time performance metrics for your Next.js app
- **[pnpm](https://pnpm.io/)** – Fast, disk space efficient package manager

### 🐘 Database

- **[PostgreSQL](https://www.postgresql.org/)** – The world's most advanced open source database

## 📦 Apps and Packages

- `web` (apps/nextjs): The main Next.js application with dashboard, cluster management, and admin interface
- `ui`: Shared UI components built with Radix UI and Tailwind CSS
- `db`: Database schema (Prisma), migrations, and data access utilities with Kysely
- `auth`: Authentication utilities (Clerk integration)
- `api`: tRPC routers and API endpoint handlers
- `stripe`: Stripe integration with retry logic, circuit breaker, and webhook handlers
- `common`: Shared utilities, types, and constants across packages

## 📜 License

This project is licensed under the MIT License. For more information, see the [LICENSE](./LICENSE) file.

## 🙏 Credits

This project was inspired by shadcn's [Taxonomy](https://github.com/shadcn-ui/taxonomy) and t3-oss's [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo).

## 👨‍💻 Contributors

<a href="https://github.com/cpa03/basefly/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=basefly/basefly" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

<!-- Badges and links -->

[check-workflow-badge]: https://img.shields.io/github/actions/workflow/status/cpa03/basefly/on-pull.yml?label=ci
[github-license-badge]: https://img.shields.io/badge/License-MIT-green.svg
[discord-badge]: https://img.shields.io/discord/1204690198382911488?color=7b8dcd&link=https%3A%2F%2Fsaasfly.io%2Fdiscord
[made-by-nextify-badge]: https://img.shields.io/badge/made_by-nextify-blue?color=FF782B&link=https://nextify.ltd/

[check-workflow-badge-link]: https://github.com/cpa03/basefly/actions/workflows/on-pull.yml
[github-license-badge-link]: https://github.com/cpa03/basefly/blob/main/LICENSE
[discord-badge-link]: https://discord.gg/8SwSX43wnD
[made-by-nextify-badge-link]: https://nextify.ltd
