import { ROUTES } from "@saasfly/common";

import type { DocsConfig } from "~/types";

export const getDocsConfig = (_lang: string): DocsConfig => {
  return {
    mainNav: [
      {
        title: "Documentation",
        href: ROUTES.docs.home,
      },
      {
        title: "Guides",
        href: `/guides`,
      },
    ],
    sidebarNav: [
      {
        id: "docs",
        title: "Getting Started",
        items: [
          {
            title: "Introduction",
            href: ROUTES.docs.home,
          },
        ],
      },
      {
        id: "documentation",
        title: "Documentation",
        items: [
          {
            title: "Introduction",
            href: ROUTES.docs.documentation,
          },
          {
            title: "Contentlayer",
            href: ROUTES.docs.inProgress,
            disabled: true,
          },
          {
            title: "Components",
            href: ROUTES.docs.components,
          },
          {
            title: "Code Blocks",
            href: ROUTES.docs.codeBlocks,
          },
          {
            title: "Style Guide",
            href: ROUTES.docs.styleGuide,
          },
        ],
      },
      {
        id: "blog",
        title: "Blog",
        items: [
          {
            title: "Introduction",
            href: ROUTES.docs.inProgress,
            disabled: true,
          },
        ],
      },
      {
        id: "dashboard",
        title: "Dashboard",
        items: [
          {
            title: "Introduction",
            href: ROUTES.docs.inProgress,
            disabled: true,
          },
          {
            title: "Layouts",
            href: ROUTES.docs.inProgress,
            disabled: true,
          },
          {
            title: "Server Components",
            href: ROUTES.docs.inProgress,
            disabled: true,
          },
          {
            title: "Authentication",
            href: ROUTES.docs.inProgress,
            disabled: true,
          },
          {
            title: "Database with Prisma",
            href: ROUTES.docs.inProgress,
            disabled: true,
          },
          {
            title: "API Routes",
            href: ROUTES.docs.inProgress,
            disabled: true,
          },
        ],
      },
    ],
  };
};
