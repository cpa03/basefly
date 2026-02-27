<div align="center" width="100%">
    <img src="./saasfly-logo.svg" width="128" alt="" />
</div>

# Basefly

<a href="https://trendshift.io/repositories/8929" target="_blank"><img src="https://trendshift.io/api/badge/repositories/8929" alt="basefly%2Fbasefly | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

[![GitHub Actions工作流状态][check-workflow-badge]][check-workflow-badge-link] [![GitHub许可证][github-license-badge]][github-license-badge-link] [![Discord][discord-badge]][discord-badge-link] [![Saasfly][made-by-nextify-badge]][made-by-nextify-badge-link]
[![English](https://img.shields.io/badge/-English-grey.svg)](README.md)
[![German](https://img.shields.io/badge/-German-yellow.svg)](README_de.md)
[![Vietnamese](https://img.shields.io/badge/-Vietnamese-yellow.svg)](README_vi.md) </br>
![COMMIT_ACTIVITY](https://img.shields.io/github/commit-activity/m/basefly/basefly?style=for-the-badge)
[![Visitors](https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Fcpa03%2Fbasefly&labelColor=%23f47373&countColor=%23263759)](https://visitorbadge.io/status?path=https%3A%2F%2Fgithub.com%2Fcpa03%2Fbasefly)

一个企业级 Kubernetes 集群管理平台。

Basefly 通过现代 Web 界面简化 Kubernetes 集群的部署和管理，提供基于订阅的访问层级和通过 Stripe 集成的计费功能。

> **[Nextify](https://nextify.ltd)** 提供完整的企业SaaS解决方案。如果您有兴趣讨论您的项目,或者您只是想与我们交谈,请随时与我们联系[contact@nextify.ltd](mailto:contact@nextify.ltd)。

> ❤️ 我们为**非营利组织提供免费的技术支持和部署服务**。
>
> 🙌 从我们的开源项目中获得的**所有利润将完全用于支持开源计划和慈善事业**。

## ⚡ 在线演示

亲自试一试吧!

演示服务器 (位置: 美国华盛顿): <https://show.saasfly.io>

查看更多文档请访问 <https://docs.saasfly.io>

## 🌟 Star历史

[![Star History Chart](https://app.repohistory.com/api/svg?repo=cpa03/basefly&type=Timeline)](https://repohistory.com)

## 赞助商

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
  在此添加您的 Logo
</a>

## 🚀 入门指南

### 🖱 一键模板

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbasefly%2Fbasefly&env=NEXT_PUBLIC_APP_URL,CLERK_SECRET_KEY,CLERK_PUBLISHABLE_KEY,STRIPE_API_KEY,STRIPE_WEBHOOK_SECRET,POSTGRES_URL,RESEND_API_KEY,RESEND_FROM,ADMIN_EMAIL,NEXT_PUBLIC_STRIPE_STD_PRODUCT_ID,NEXT_PUBLIC_STRIPE_STD_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID,NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID,NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID&install-command=pnpm%20install&build-command=pnpm%20run%20build&root-directory=apps%2Fnextjs)

### 📋 前提条件

开始之前,请确保您已安装以下内容:

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

2. [PostgreSQL](https://www.postgresql.org/) - 用于集群配置和用户数据
   1. 您可以使用Vercel Postgres或本地PostgreSQL服务器(在.env.local中添加POSTGRES_URL环境变量)
      ```bash
         POSTGRES_URL=''
      ```

3. [Clerk](https://clerk.com/) 账户 - 用于身份验证
   1. 创建Clerk账户并获取API密钥
   2. 添加Clerk应用程序并配置Next.js

4. [Stripe](https://stripe.com/) 账户 - 用于订阅计费
   1. 创建Stripe账户
   2. 获取API密钥并设置webhook端点

### 安装

要开始使用此样板,我们提供两个选项:

1. 使用`pnpm create`命令(🌟强烈推荐🌟):

```bash
pnpm create basefly
```

2. 手动克隆存储库:

```bash
git clone https://github.com/cpa03/basefly.git
cd basefly
pnpm install
```

### 设置

按照以下步骤设置您的项目:

1. 设置环境变量:

```bash
cp .env.example .env.local
# 配置所需的环境变量（详见 .env.example）
# 必需：Clerk 密钥、Stripe 密钥、PostgreSQL URL、Resend API 密钥
pnpm db:push
```

2. 运行开发服务器:

```bash
pnpm run dev:web
```

3. 在浏览器中打开[http://localhost:3000](http://localhost:3000)查看结果。

4. （可选的 Alpha 功能）`pnpm run tailwind-config-viewer` 在你的浏览器中打开 [http://localhost:3333](http://localhost:3333) 查看你的 Tailwind CSS 配置。

5. 使用 `ADMIN_EMAIL` 环境变量中配置的邮箱地址访问管理仪表板 `/admin/dashboard`。

## 🎯 核心功能

### Kubernetes 集群管理

- 通过 Web 界面创建和管理 Kubernetes 集群
- 多种订阅层级（FREE、PRO、BUSINESS），具有不同的资源限制
- 集群状态跟踪（PENDING、CREATING、INITING、RUNNING、STOPPED）
- 支持软删除以保留集群

### 订阅与计费

- 集成 Stripe 订阅计费
- 多种定价方案，自动配置
- 基于 Webhook 的订阅状态同步
- 客户门户用于订阅管理

### 企业功能

- 多语言支持（英语、中文、德语、越南语）
- 基于角色的访问控制（管理仪表板）
- 使用软删除模式保留审计跟踪
- 使用 tRPC 的类型安全 API
- 具有重试逻辑的全面错误处理

## 🥺 项目路线图

1. 增强管理仪表板
   1. 目前处于alpha阶段 - 提供基本的管理视图
   2. 在 `ADMIN_EMAIL` 环境变量中配置管理员邮箱
   3. 访问 `/admin/dashboard`
   4. 安全说明：不提供在线管理演示

2. 高级 Kubernetes 功能
   1. 集群监控和指标集成
   2. 节点池管理
   3. 自动扩缩容配置

3. 其他集成
   1. 考虑集成 Payload CMS 进行内容管理
   2. 增强通知系统
   3. 使用分析和报告

## ⭐ 特性

### 🐭 框架与核心

- **[Next.js](https://nextjs.org/)** - React 网络框架 (使用**App Directory**)
- **[Clerk](https://clerk.com/)** - 完整的用户管理和身份验证平台
- **[Kysely](https://kysely.dev/)** - 用于TypeScript的类型安全SQL查询构建器
- **[Prisma](https://www.prisma.io/)** - 用于Node.js和TypeScript的下一代ORM,用作架构管理工具
- **[React-email](https://react.email/)** - 一个React渲染器,用于使用React组件创建漂亮的电子邮件

### 🐮 平台与集成

- **[Clerk](https://go.clerk.com/uKDp7Au)** - 完整的用户身份验证和管理
- **[Vercel](https://vercel.com/)** – 轻松部署您的Next.js应用
- **[Stripe](https://stripe.com/)** – 支付处理和订阅计费
- **[Resend](https://resend.com/)** – 用于事务性邮件的电子邮件营销平台

### 🐯 企业功能

- **[i18n](https://nextjs.org/docs/app/building-your-application/routing/internationalization)** - 对国际化的支持
- **[SEO](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)** - 搜索引擎优化
- **[MonoRepo](https://turbo.build/)** - Monorepo以更好地管理代码
- **[T3 Env](https://env.t3.gg/)** - 轻松管理您的环境变量

### 🐰 数据获取

- **[trpc](https://trpc.io/)** – 轻松创建端到端类型安全API
- **[tanstack/react-query](https://react-query.tanstack.com/)** – 在React中用于获取、缓存和更新异步数据的钩子

### 🐲 全局状态管理

- **[Zustand](https://zustand.surge.sh/)** – 适用于React的小型、快速且可扩展的状态管理

### 🐒 UI

- **[Tailwind CSS](https://tailwindcss.com/)** – 用于快速UI开发的实用程序优先CSS框架
- **[Shadcn/ui](https://ui.shadcn.com/)** – 使用Radix UI和Tailwind CSS构建的可重用组件
- **[Framer Motion](https://framer.com/motion)** – 适用于React的动画库,可轻松为组件添加动画
- **[Lucide](https://lucide.dev/)** – 简单美观、像素完美的图标
- **[next/font](https://nextjs.org/docs/basic-features/font-optimization)** – 优化自定义字体并删除外部网络请求以提高性能

### 🐴 代码质量

- **[TypeScript](https://www.typescriptlang.org/)** – 端到端类型安全的静态类型检查器
- **[Prettier](https://prettier.io/)** – 用于一致代码风格的固执的代码格式化程序
- **[ESLint](https://eslint.org/)** – 适用于Next.js和TypeScript的可插拔linter
- **[Husky](https://typicode.github.io/husky)** – 轻松使用Git钩子

### 🐑 性能

- **[Vercel Analytics](https://vercel.com/analytics)** – 用于Next.js应用的实时性能指标
- **[pnpm](https://pnpm.io/)** – 快速、节省磁盘空间的包管理器

### 🐘 数据库

- **[PostgreSQL](https://www.postgresql.org/)** – 世界上最先进的开源数据库

## 📦 应用和软件包

- `web` (apps/nextjs): 主要的Next.js应用程序，包含仪表板、集群管理和后台管理界面
- `ui`: 使用 Radix UI 和 Tailwind CSS 构建的共享 UI 组件
- `db`: 数据库模式 (Prisma)、迁移和使用 Kysely 的数据访问工具
- `auth`: 身份验证实用程序 (Clerk 集成)
- `api`: tRPC 路由器和 API 端点处理器
- `stripe`: Stripe 集成，包含重试逻辑、断路器和 webhook 处理器
- `common`: 跨包共享的工具、类型和常量

## 📜 许可证

本项目采用MIT许可证。有关更多信息,请参阅[LICENSE](./LICENSE)文件。

## 🙏 致谢

本项目的灵感来自shadcn的[Taxonomy](https://github.com/shadcn-ui/taxonomy)和t3-oss的[create-t3-turbo](https://github.com/t3-oss/create-t3-turbo)。

## 👨‍💻 贡献者

<a href="https://github.com/cpa03/basefly/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=basefly/basefly" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

<!-- 徽章和链接 -->

[check-workflow-badge]: https://img.shields.io/github/actions/workflow/status/cpa03/basefly/on-pull.yml?label=ci
[github-license-badge]: https://img.shields.io/badge/License-MIT-green.svg
[discord-badge]: https://img.shields.io/discord/1204690198382911488?color=7b8dcd&link=https%3A%2F%2Fsaasfly.io%2Fdiscord
[made-by-nextify-badge]: https://img.shields.io/badge/made_by-nextify-blue?color=FF782B&link=https://nextify.ltd/
[check-workflow-badge-link]: https://github.com/cpa03/basefly/actions/workflows/on-pull.yml
[github-license-badge-link]: https://github.com/cpa03/basefly/blob/main/LICENSE
[discord-badge-link]: https://discord.gg/8SwSX43wnD
[made-by-nextify-badge-link]: https://nextify.ltd
