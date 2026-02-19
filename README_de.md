<div align="center" width="100%">
    <img src="./saasfly-logo.svg" width="128" alt="" />
</div>

# Basefly </br>

<a href="https://trendshift.io/repositories/8929" target="_blank"><img src="https://trendshift.io/api/badge/repositories/8929" alt="basefly%2Fbasefly | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

[![GitHub Actions Workflow Status][check-workflow-badge]][check-workflow-badge-link] [![GitHub License][github-license-badge]][github-license-badge-link] [![Discord][discord-badge]][discord-badge-link] [![Saasfly][made-by-nextify-badge]][made-by-nextify-badge-link]
[![English](https://img.shields.io/badge/-English-grey.svg)](README.md)
[![Chinese](https://img.shields.io/badge/-Chinese-red.svg)](README_zh.md)
[![Vietnamese](https://img.shields.io/badge/-Vietnamese-yellow.svg)](README_vi.md) </br>
![COMMIT_ACTIVITY](https://img.shields.io/github/commit-activity/m/basefly/basefly?style=for-the-badge)
[![Visitors](https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2Fcpa03%2Fbasefly&labelColor=%23f47373&countColor=%23263759)](https://visitorbadge.io/status?path=https%3A%2F%2Fgithub.com%2Fcpa03%2Fbasefly)

Eine Kubernetes-Cluster-Management-Plattform für Unternehmen.

Basefly vereinfacht die Bereitstellung und Verwaltung von Kubernetes-Clustern mit einer modernen Weboberfläche, abonnementbasierten Zugriffsstufen und integrierter Abrechnung über Stripe.

> **[Nextify](https://nextify.ltd)** bietet eine komplette Enterprise-SaaS-Lösung an. Kontaktieren Sie uns unter [contact@nextify.ltd](mailto:contact@nextify.ltd), wenn Sie Interesse an einer Besprechung Ihres Projekts haben oder wenn Sie einfach ein Gespräch mit uns führen möchten. Zögern Sie bitte nicht, uns zu kontaktieren.

> ❤️ Wir bieten **kostenlose technische Unterstützung und Bereitstellungsdienste für gemeinnützige Organisationen** an.
>
> 🙌 Alle Gewinne aus unseren Open-Source-Projekten werden **ausschließlich zur Unterstützung von Open-Source-Initiativen und wohltätigen Zwecken verwendet**.

## ⚡ Live-Demo

Probieren Sie es selbst aus!

Demo-Server (Standort: Washington, USA): <https://show.saasfly.io>

Weitere Dokumentation finden Sie unter <https://docs.saasfly.io>.

## 🌟 Stern-Verlauf

[![Star History Chart](https://app.repohistory.com/api/svg?repo=cpa03/basefly&type=Timeline)](https://repohistory.com)

## Sponsoren

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
  Fügen Sie hier Ihr Logo hinzu
</a>

## 🚀 Erste Schritte

### 🖱 One-Click-Vorlage

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbasefly%2Fbasefly&env=NEXT_PUBLIC_APP_URL,CLERK_SECRET_KEY,CLERK_PUBLISHABLE_KEY,STRIPE_API_KEY,STRIPE_WEBHOOK_SECRET,POSTGRES_URL,RESEND_API_KEY,RESEND_FROM,ADMIN_EMAIL,NEXT_PUBLIC_STRIPE_STD_PRODUCT_ID,NEXT_PUBLIC_STRIPE_STD_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID,NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,NEXT_PUBLIC_STRIPE_BUSINESS_PRODUCT_ID,NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID&install-command=pnpm%20install&build-command=pnpm%20run%20build&root-directory=apps%2Fnextjs)

### 📋 Voraussetzungen

Stellen Sie vor dem Start sicher, dass Sie Folgendes installiert haben:

1. [pnpm](https://pnpm.io/), [Node.js](https://nodejs.org/) und [Git](https://git-scm.com/)
   1. Linux

   ```bash
     curl -fsSL https://get.pnpm.io/install.sh | sh -
   ```

   2. macOS

   ```bash
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     brew install git
     brew install pnpm
   ```

2. [PostgreSQL](https://www.postgresql.org/) - Erforderlich für Cluster-Konfiguration und Benutzerdaten
   1. Sie können entweder Vercel Postgres oder einen lokalen PostgreSQL-Server verwenden (fügen Sie die POSTGRES_URL-Umgebungsvariable in .env.local hinzu)
      ```bash
         POSTGRES_URL = ''
      ```

3. [Clerk](https://clerk.com/) Konto - Für die Authentifizierung
   1. Erstellen Sie ein Clerk-Konto und erhalten Sie API-Schlüssel
   2. Fügen Sie eine Clerk-Anwendung mit Next.js-Konfiguration hinzu

4. [Stripe](https://stripe.com/) Konto - Für Abonnementabrechnung
   1. Erstellen Sie ein Stripe-Konto
   2. Erhalten Sie API-Schlüssel und richten Sie den Webhook-Endpunkt ein

### Installation

Für den Einstieg mit dieser Vorlage bieten wir zwei Möglichkeiten an:

1. Verwenden Sie den Befehl `pnpm create` (🌟dringend empfohlen🌟):

```bash
pnpm create basefly
```

2. Klonen Sie das Repository manuell:

```bash
git clone https://github.com/cpa03/basefly.git
cd basefly
pnpm install
```

### Einrichtung

Führen Sie die folgenden Schritte aus, um Ihr Projekt einzurichten:

1. Richten Sie die Umgebungsvariablen ein:

```bash
cp .env.example .env.local
# Konfigurieren Sie die erforderlichen Umgebungsvariablen (siehe .env.example)
# Erforderlich: Clerk-Schlüssel, Stripe-Schlüssel, PostgreSQL-URL, Resend-API-Schlüssel
pnpm db:push
```

2. Starten Sie den Entwicklungsserver:

```bash
pnpm run dev:web
```

3. Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser, um das Ergebnis zu sehen.

4. (Optional Alpha) `pnpm run tailwind-config-viewer`
   Öffnen Sie [http://localhost:3333](http://localhost:3333) im Browser, um Ihre Tailwind CSS Konfiguration anzuzeigen.

5. Greifen Sie auf das Admin-Dashboard unter `/admin/dashboard` zu, indem Sie E-Mail-Adressen verwenden, die in der Umgebungsvariable `ADMIN_EMAIL` konfiguriert sind.

## 🎯 Hauptfunktionen

### Kubernetes-Cluster-Verwaltung

- Erstellen und Verwalten von Kubernetes-Clustern über eine Weboberfläche
- Mehrere Abonnementstufen (FREE, PRO, BUSINESS) mit unterschiedlichen Ressourcenlimits
- Cluster-Status-Tracking (PENDING, CREATING, INITING, RUNNING, STOPPED)
- Soft-Delete-Unterstützung zur Cluster-Erhaltung

### Abonnement & Abrechnung

- Integrierte Stripe-Abonnementabrechnung
- Mehrere Preispläne mit automatischer Bereitstellung
- Webhook-basierte Abonnement-Status-Synchronisation
- Kundenportal zur Abonnementverwaltung

### Unternehmensfunktionen

- Mehrsprachige Unterstützung (Englisch, Chinesisch, Deutsch, Vietnamesisch)
- Rollenbasierte Zugriffskontrolle (Admin-Dashboard)
- Audit-Trail-Erhaltung mit Soft-Delete-Mustern
- Typsichere API mit tRPC
- Umfassende Fehlerbehandlung mit Wiederholungslogik

## 🥺 Projekt-Roadmap

1. Erweitertes Admin-Dashboard
   1. Derzeit in Alpha - bietet grundlegende Administratoransichten
   2. Konfigurieren Sie Admin-E-Mails in der Umgebungsvariable `ADMIN_EMAIL`
   3. Zugriff unter `/admin/dashboard`
   4. Sicherheit: Keine Online-Admin-Demos verfügbar

2. Erweiterte Kubernetes-Funktionen
   1. Cluster-Überwachung und Metrik-Integration
   2. Node-Pool-Verwaltung
   3. Auto-Scaling-Konfiguration

3. Zusätzliche Integrationen
   1. Erwägen Sie die Integration von Payload CMS für Content-Management
   2. Erweitertes Benachrichtigungssystem
   3. Nutzungsanalysen und Berichterstattung

## ⭐ Funktionen

### 🐭 Frameworks & Kern

- **[Next.js](https://nextjs.org/)** - Das React-Framework für das Web (mit **App Directory**)
- **[Clerk](https://clerk.com/)** - Vollständige Benutzerverwaltungs- und Authentifizierungsplattform
- **[Kysely](https://kysely.dev/)** - Der typsichere SQL-Abfrageersteller für TypeScript
- **[Prisma](https://www.prisma.io/)** - ORM der nächsten Generation für Node.js und TypeScript, verwendet als Schemaverwaltungstool
- **[React-email](https://react.email/)** - Ein React-Renderer zum Erstellen schöner E-Mails mit React-Komponenten

### 🐮 Plattformen & Integrationen

- **[Clerk](https://go.clerk.com/uKDp7Au)** - Vollständige Benutzerauthentifizierung und -verwaltung
- **[Vercel](https://vercel.com/)** – Stellen Sie Ihre Next.js-App ganz einfach bereit
- **[Stripe](https://stripe.com/)** – Zahlungsabwicklung und Abonnementabrechnung
- **[Resend](https://resend.com/)** – E-Mail-Marketing-Plattform für Transaktions-E-Mails

### 🐯 Unternehmensfunktionen

- **[i18n](https://nextjs.org/docs/app/building-your-application/routing/internationalization)** - Unterstützung für Internationalisierung
- **[SEO](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)** - Suchmaschinenoptimierung
- **[MonoRepo](https://turbo.build/)** - Monorepo für eine bessere Code-Verwaltung
- **[T3 Env](https://env.t3.gg/)** - Verwalten Sie Ihre Umgebungsvariablen mit Leichtigkeit

### 🐰 Datenbeschaffung

- **[trpc](https://trpc.io/)** – End-to-End typsichere APIs leicht gemacht
- **[tanstack/react-query](https://react-query.tanstack.com/)** – Hooks zum Abrufen, Zwischenspeichern und Aktualisieren asynchroner Daten in React

### 🐲 Globale Zustandsverwaltung

- **[Zustand](https://zustand.surge.sh/)** – Kleine, schnelle und skalierbare Zustandsverwaltung für React

### 🐒 UI

- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-First-CSS-Framework für eine schnelle UI-Entwicklung
- **[Shadcn/ui](https://ui.shadcn.com/)** – Wiederverwendbare Komponenten, die mit Radix UI und Tailwind CSS erstellt wurden
- **[Framer Motion](https://framer.com/motion)** – Motion-Bibliothek für React zur einfachen Animation von Komponenten
- **[Lucide](https://lucide.dev/)** – Wunderschöne, einfache, pixelgenaue Symbole
- **[next/font](https://nextjs.org/docs/basic-features/font-optimization)** – Optimieren Sie benutzerdefinierte Schriftarten und entfernen Sie externe Netzwerkanforderungen zur Leistungsverbesserung

### 🐴 Code-Qualität

- **[TypeScript](https://www.typescriptlang.org/)** – Statischer Typprüfer für durchgängige Typsicherheit
- **[Prettier](https://prettier.io/)** – Opinionated Code Formatter für einen konsistenten Code-Stil
- **[ESLint](https://eslint.org/)** – Pluggable Linter für Next.js und TypeScript
- **[Husky](https://typicode.github.io/husky)** – Git-Hooks leicht gemacht

### 🐑 Leistung

- **[Vercel Analytics](https://vercel.com/analytics)** – Echtzeit-Leistungsmetriken für Ihre Next.js-App
- **[pnpm](https://pnpm.io/)** – Schneller, platzsparender Paketmanager

### 🐘 Datenbank

- **[PostgreSQL](https://www.postgresql.org/)** – Die weltweit fortschrittlichste Open-Source-Datenbank

## 📦 Apps und Pakete

- `web` (apps/nextjs): Die Hauptanwendung von Next.js mit Dashboard, Cluster-Verwaltung und Admin-Oberfläche
- `ui`: Gemeinsam genutzte UI-Komponenten, die mit Radix UI und Tailwind CSS erstellt wurden
- `db`: Datenbankschema (Prisma), Migrationen und Datenzugriffsdienstprogramme mit Kysely
- `auth`: Authentifizierungs-Utilities (Clerk-Integration)
- `api`: tRPC-Router und API-Endpunkt-Handler
- `stripe`: Stripe-Integration mit Wiederholungslogik, Circuit Breaker und Webhook-Handlern
- `common`: Gemeinsam genutzte Dienstprogramme, Typen und Konstanten über Pakete hinweg

## 📜 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Weitere Informationen finden Sie in der Datei [LICENSE](./LICENSE).

## 🙏 Credits

Dieses Projekt wurde von shadcns [Taxonomy](https://github.com/shadcn-ui/taxonomy) und t3-oss' [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) inspiriert.

## 👨‍💻 Mitwirkende

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
