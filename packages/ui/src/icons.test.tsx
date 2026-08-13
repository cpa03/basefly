import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Activity,
  Add,
  ArrowRight,
  Billing,
  Blocks,
  Check,
  ChevronLeft,
  ChevronRight,
  ClerkWide,
  Clock,
  Close,
  Cluster,
  Copy,
  CopyDone,
  CreditCard,
  Dashboard,
  Ellipsis,
  GitHub,
  Google,
  Heart,
  Help,
  Key,
  Kysely,
  Languages,
  Laptop,
  Loader2,
  Logo,
  Mdx,
  Menu,
  Moon,
  Nextjs,
  Organization,
  Page,
  PauseCircle,
  Post,
  Prisma,
  React as ReactIcon,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Spinner,
  Sun,
  System,
  Tailwind,
  ThumbsUp,
  Trash,
  TRPC,
  Twitter,
  User,
  Users,
  Warning,
  XCircle,
} from "./icons";

// Lucide-based icon re-exports
const lucideIcons = [
  ["Add", Add],
  ["Activity", Activity],
  ["ArrowRight", ArrowRight],
  ["Billing", Billing],
  ["Blocks", Blocks],
  ["Check", Check],
  ["ChevronLeft", ChevronLeft],
  ["ChevronRight", ChevronRight],
  ["Clock", Clock],
  ["Close", Close],
  ["Cluster", Cluster],
  ["Copy", Copy],
  ["CopyDone", CopyDone],
  ["CreditCard", CreditCard],
  ["Dashboard", Dashboard],
  ["Ellipsis", Ellipsis],
  ["Heart", Heart],
  ["Help", Help],
  ["Key", Key],
  ["Languages", Languages],
  ["Laptop", Laptop],
  ["Loader2", Loader2],
  ["Logo", Logo],
  ["Menu", Menu],
  ["Moon", Moon],
  ["Organization", Organization],
  ["Page", Page],
  ["PauseCircle", PauseCircle],
  ["Post", Post],
  ["Rocket", Rocket],
  ["Search", Search],
  ["Settings", Settings],
  ["ShieldCheck", ShieldCheck],
  ["Spinner", Spinner],
  ["Sun", Sun],
  ["ThumbsUp", ThumbsUp],
  ["Trash", Trash],
  ["Twitter", Twitter],
  ["User", User],
  ["Users", Users],
  ["Warning", Warning],
  ["XCircle", XCircle],
] as const;

describe("Lucide-based icon exports", () => {
  it.each(lucideIcons)("%s should render an svg element", (_name, Icon) => {
    const { container } = render(<Icon data-testid="icon" />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should forward props to the svg element", () => {
    const { container } = render(<Add className="custom-icon" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-icon");
  });
});

// Custom inline SVG icons
const customIcons = [
  ["System", System],
  ["Mdx", Mdx],
  ["ClerkWide", ClerkWide],
  ["TRPC", TRPC],
  ["GitHub", GitHub],
  ["React", ReactIcon],
  ["Nextjs", Nextjs],
  ["Prisma", Prisma],
  ["Kysely", Kysely],
  ["Tailwind", Tailwind],
  ["Google", Google],
] as const;

describe("Custom SVG icon exports", () => {
  it.each(customIcons)("%s should render an svg element", (_name, Icon) => {
    const { container } = render(<Icon data-testid="custom-icon" />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should forward props to custom svg elements", () => {
    const { container } = render(<System className="custom-system" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-system");
  });
});

describe("Icon type", () => {
  it("should accept LucideProps-compatible props on all icons", () => {
    const { container } = render(
      <div>
        <Add size={24} strokeWidth={2} />
        <System size={24} />
        <GitHub width={32} height={32} />
      </div>,
    );

    expect(container.querySelectorAll("svg")).toHaveLength(3);
  });
});
