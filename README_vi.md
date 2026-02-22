<div align="center" width="100%">
    <img src="./saasfly-logo.svg" width="128" alt="" />
</div>

# Basefly

<a href="https://trendshift.io/repositories/8929" target="_blank"><img src="https://trendshift.io/api/badge/repositories/8929" alt="basefly%2Fbasefly | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

[![Trạng thái quy trình làm việc GitHub Actions][check-workflow-badge]][check-workflow-badge-link] [![Giấy phép GitHub][github-license-badge]][github-license-badge-link] [![Discord][discord-badge]][discord-badge-link] [![Saasfly][made-by-nextify-badge]][made-by-nextify-badge-link]
[![English](https://img.shields.io/badge/-English-grey.svg)](README.md)
[![Chinese](https://img.shields.io/badge/-Chinese-red.svg)](README_zh.md)
[![German](https://img.shields.io/badge/-German-yellow.svg)](README_de.md) </br>
![COMMIT_ACTIVITY](https://img.shields.io/github/commit-activity/m/basefly/basefly?style=for-the-badge)
[![Visitors](https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Fcpa03%2Fbasefly&labelColor=%23f47373&countColor=%23263759)](https://visitorbadge.io/status?path=https%3A%2F%2Fgithub.com%2Fcpa03%2Fbasefly)

Một nền tảng quản lý cụm Kubernetes cấp doanh nghiệp.

Basefly đơn giản hóa việc triển khai và quản lý cụm Kubernetes với giao diện web hiện đại, các cấp độ truy cập dựa trên đăng ký và thanh toán tích hợp thông qua Stripe.

> **[Nextify](https://nextify.ltd)** cung cấp giải pháp SaaS doanh nghiệp toàn diện. Nếu bạn quan tâm đến việc thảo luận về dự án của mình hoặc chỉ muốn trò chuyện với chúng tôi, vui lòng liên hệ với chúng tôi tại [contact@nextify.ltd](mailto:contact@nextify.ltd).

> ❤️ Chúng tôi cung cấp **hỗ trợ kỹ thuật và triển khai miễn phí cho các tổ chức phi lợi nhuận**.
>
> 🙌 Tất cả lợi nhuận thu được từ các dự án nguồn mở của chúng tôi sẽ được sử dụng hoàn toàn để hỗ trợ các chương trình và hoạt động từ thiện nguồn mở.

## ⚡ Demo trực tuyến

Tự mình thử nó!

Máy chủ demo (Địa điểm: Washington, Hoa Kỳ): <https://show.saasfly.io>

Để xem thêm tài liệu, hãy truy cập <https://docs.saasfly.io>

## 🌟 Lịch sử Star

[![Biểu đồ lịch sử Star](https://app.repohistory.com/api/svg?repo=cpa03/basefly&type=Timeline)](https://repohistory.com)

## Nhà tài trợ

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
  Thêm logo của bạn ở đây
</a>

## 🚀 Bắt đầu

### 🖱 Mẫu một lần nhấp

[![Triển khai với Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbasefly%2Fbasefly&env=NEXT_PUBLIC_APP_URL,CLERK_SECRET_KEY,CLERK_PUBLISHABLE_KEY,STRIPE_API_KEY,STRIPE_WEBHOOK_SECRET,POSTGRES_URL,RESEND_API_KEY,RESEND_FROM,ADMIN_EMAIL,NEXT_PUBLIC_STRIPE_STD_PRODUCT_ID,NEXT_PUBLIC_STRIPE_STD_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID,NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID,NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID&install-command=pnpm%20install&build-command=pnpm%20run%20build&root-directory=apps%2Fnextjs)

### 📋 Điều kiện tiên quyết

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các thành phần sau:

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

2. [PostgreSQL](https://www.postgresql.org/) - Cần thiết cho cấu hình cụm và dữ liệu người dùng
   1. Bạn có thể sử dụng Vercel Postgres hoặc máy chủ PostgreSQL cục bộ (thêm biến môi trường POSTGRES_URL trong .env.local)
      ```bash
         POSTGRES_URL=''
      ```

3. [Clerk](https://clerk.com/) tài khoản - Để xác thực
   1. Tạo tài khoản Clerk và lấy API keys
   2. Thêm ứng dụng Clerk với cấu hình Next.js

4. [Stripe](https://stripe.com/) tài khoản - Cho thanh toán đăng ký
   1. Tạo tài khoản Stripe
   2. Lấy API keys và thiết lập endpoint webhook

### Cài đặt

Để bắt đầu với boilerplate này, chúng tôi cung cấp hai tùy chọn:

1. Sử dụng lệnh `pnpm create` (🌟Khuyến nghị cao🌟):

```bash
pnpm create basefly
```

2. Tự sao chép kho lưu trữ:

```bash
git clone https://github.com/cpa03/basefly.git
cd basefly
pnpm install
```

### Thiết lập

Làm theo các bước sau để thiết lập dự án của bạn:

1. Thiết lập các biến môi trường:

```bash
cp .env.example .env.local
# Cấu hình các biến môi trường cần thiết (xem .env.example để biết chi tiết)
# Bắt buộc: Clerk keys, Stripe keys, PostgreSQL URL, Resend API key
pnpm db:push
```

2. Chạy máy chủ phát triển:

```bash
pnpm run dev:web
```

3. Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt để xem kết quả.

4. (Tùy chọn bản alpha) `pnpm run tailwind-config-viewer`
   Mở [http://localhost:3333](http://localhost:3333) trong trình duyệt của bạn để xem cấu hình Tailwind CSS.

5. Truy cập bảng điều khiển quản trị tại `/admin/dashboard` bằng cách sử dụng các địa chỉ email được cấu hình trong biến môi trường `ADMIN_EMAIL`.

## 🎯 Tính năng chính

### Quản lý cụm Kubernetes

- Tạo và quản lý các cụm Kubernetes thông qua giao diện web
- Nhiều cấp độ đăng ký (FREE, PRO, BUSINESS) với các giới hạn tài nguyên khác nhau
- Theo dõi trạng thái cụm (PENDING, CREATING, INITING, RUNNING, STOPPED)
- Hỗ trợ xóa mềm để bảo tồn cụm

### Đăng ký & Thanh toán

- Thanh toán đăng ký Stripe tích hợp
- Nhiều gói định giá với cấp phép tự động
- Đồng bộ trạng thái đăng ký dựa trên Webhook
- Cổng khách hàng để quản lý đăng ký

### Tính năng doanh nghiệp

- Hỗ trợ đa ngôn ngữ (Tiếng Anh, Tiếng Trung, Tiếng Đức, Tiếng Việt)
- Kiểm soát truy cập dựa trên vai trò (Bảng điều khiển quản trị)
- Bảo toàn audit trail với các mẫu xóa mềm
- API an toàn kiểu với tRPC
- Xử lý lỗi toàn diện với logic thử lại

## 🥺 Lộ trình dự án

1. Bảng điều khiển quản trị nâng cao
   1. Hiện đang ở giai đoạn alpha - cung cấp chế độ xem quản trị cơ bản
   2. Cấu hình email quản trị trong biến môi trường `ADMIN_EMAIL`
   3. Truy cập tại `/admin/dashboard`
   4. Bảo mật: Không có demo quản trị trực tuyến

2. Tính năng Kubernetes nâng cao
   1. Tích hợp giám sát và chỉ số cụm
   2. Quản lý node pool
   3. Cấu hình auto-scaling

3. Các tích hợp bổ sung
   1. Cân nhắc tích hợp Payload CMS cho quản lý nội dung
   2. Hệ thống thông báo nâng cao
   3. Phân tích và báo cáo sử dụng

## ⭐ Các tính năng

### 🐭 Framework & Cốt lõi

- **[Next.js](https://nextjs.org/)** - Framework web React (sử dụng **App Directory**)
- **[Clerk](https://clerk.com/)** - Nền tảng quản lý người dùng và xác thực hoàn chỉnh
- **[Kysely](https://kysely.dev/)** - Trình xây dựng truy vấn SQL an toàn về kiểu cho TypeScript
- **[Prisma](https://www.prisma.io/)** - ORM thế hệ tiếp theo cho Node.js và TypeScript, được sử dụng như một công cụ quản lý sơ đồ
- **[React-email](https://react.email/)** - Một trình hiển thị React để tạo email đẹp bằng các thành phần React

### 🐮 Nền tảng & Tích hợp

- **[Clerk](https://go.clerk.com/uKDp7Au)** - Xác thực và quản lý người dùng hoàn chỉnh
- **[Vercel](https://vercel.com/)** – Dễ dàng triển khai ứng dụng Next.js của bạn
- **[Stripe](https://stripe.com/)** – Xử lý thanh toán và thanh toán đăng ký
- **[Resend](https://resend.com/)** – Nền tảng email marketing cho email giao dịch

### 🐯 Tính năng doanh nghiệp

- **[i18n](https://nextjs.org/docs/app/building-your-application/routing/internationalization)** - Hỗ trợ quốc tế hóa
- **[SEO](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)** - Tối ưu hóa công cụ tìm kiếm
- **[MonoRepo](https://turbo.build/)** - Monorepo để quản lý mã tốt hơn
- **[T3 Env](https://env.t3.gg/)** - Dễ dàng quản lý biến môi trường của bạn

### 🐰 Truy xuất dữ liệu

- **[trpc](https://trpc.io/)** – Dễ dàng tạo API an toàn về kiểu từ đầu đến cuối
- **[tanstack/react-query](https://react-query.tanstack.com/)** – Các hook để tìm nạp, lưu vào bộ nhớ đệm và cập nhật dữ liệu không đồng bộ trong React

### 🐲 Quản lý trạng thái toàn cục

- **[Zustand](https://zustand.surge.sh/)** – Quản lý trạng thái mạnh mẽ, nhỏ gọn và có thể mở rộng cho React

### 🐒 UI

- **[Tailwind CSS](https://tailwindcss.com/)** – Framework CSS tiện ích first cho phát triển UI nhanh
- **[Shadcn/ui](https://ui.shadcn.com/)** – Các thành phần có thể tái sử dụng được xây dựng bằng Radix UI và Tailwind CSS
- **[Framer Motion](https://framer.com/motion)** – Thư viện hoạt ảnh cho React để dễ dàng thêm hoạt ảnh cho các thành phần
- **[Lucide](https://lucide.dev/)** – Các biểu tượng đẹp, đơn giản, hoàn hảo từng pixel
- **[next/font](https://nextjs.org/docs/basic-features/font-optimization)** – Tối ưu hóa phông chữ tùy chỉnh và loại bỏ các yêu cầu mạng bên ngoài để cải thiện hiệu suất

### 🐴 Chất lượng mã

- **[TypeScript](https://www.typescriptlang.org/)** – Trình kiểm tra kiểu tĩnh an toàn kiểu từ đầu đến cuối
- **[Prettier](https://prettier.io/)** – Trình định dạng mã cố chấp cho phong cách mã nhất quán
- **[ESLint](https://eslint.org/)** – Trình kiểm tra có thể bổ sung cho Next.js và TypeScript
- **[Husky](https://typicode.github.io/husky)** – Dễ dàng sử dụng các hook Git

### 🐑 Hiệu suất

- **[Vercel Analytics](https://vercel.com/analytics)** – Số liệu hiệu suất thời gian thực cho các ứng dụng Next.js
- **[pnpm](https://pnpm.io/)** – Quản lý gói nhanh, tiết kiệm không gian đĩa

### 🐘 Cơ sở dữ liệu

- **[PostgreSQL](https://www.postgresql.org/)** – Cơ sở dữ liệu nguồn mở tiên tiến nhất thế giới

## 📦 Ứng dụng và gói

- `web` (apps/nextjs): Ứng dụng Next.js chính với bảng điều khiển, quản lý cụm và giao diện quản trị
- `ui`: Các thành phần UI chia sẻ được xây dựng bằng Radix UI và Tailwind CSS
- `db`: Sơ đồ cơ sở dữ liệu (Prisma), di chuyển và tiện ích truy cập dữ liệu với Kysely
- `auth`: Tiện ích xác thực (tích hợp Clerk)
- `api`: Bộ định tuyến tRPC và bộ xử lý endpoint API
- `stripe`: Tích hợp Stripe với logic thử lại, circuit breaker và bộ xử lý webhook
- `common`: Các tiện ích, loại và hằng số được chia sẻ giữa các gói

## 📜 Giấy phép

Dự án này được cấp phép theo Giấy phép MIT. Để biết thêm thông tin, hãy xem tập tin [LICENSE](./LICENSE).

## 🙏 Lời cảm ơn

Dự án này lấy cảm hứng từ [Taxonomy](https://github.com/shadcn-ui/taxonomy) của shadcn và [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo)của t3-oss.

## 👨‍💻 Người đóng góp

<a href="https://github.com/cpa03/basefly/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=basefly/basefly" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

<!-- Huy hiệu và liên kết -->

[check-workflow-badge]: https://img.shields.io/github/actions/workflow/status/cpa03/basefly/on-pull.yml?label=ci
[github-license-badge]: https://img.shields.io/badge/License-MIT-green.svg
[discord-badge]: https://img.shields.io/discord/1204690198382911488?color=7b8dcd&link=https%3A%2F%2Fsaasfly.io%2Fdiscord
[made-by-nextify-badge]: https://img.shields.io/badge/made_by-nextify-blue?color=FF782B&link=https://nextify.ltd/
[check-workflow-badge-link]: https://github.com/cpa03/basefly/actions/workflows/on-pull.yml
[github-license-badge-link]: https://github.com/cpa03/basefly/blob/main/LICENSE
[discord-badge-link]: https://discord.gg/8SwSX43wnD
[made-by-nextify-badge-link]: https://nextify.ltd
