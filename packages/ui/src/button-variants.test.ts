import { describe, expect, it } from "vitest";

import { buttonVariants, type ButtonVariantProps } from "./button-variants";

describe("button-variants.ts - buttonVariants", () => {
  it("should have default variant", () => {
    const result = buttonVariants();
    expect(result).toContain("bg-primary");
    expect(result).toContain("text-primary-foreground");
    expect(result).toContain("h-10");
    expect(result).toContain("px-4");
  });

  it("should apply default variant explicitly", () => {
    const result = buttonVariants({ variant: "default" });
    expect(result).toContain("bg-primary");
    expect(result).toContain("text-primary-foreground");
  });

  it("should apply destructive variant", () => {
    const result = buttonVariants({ variant: "destructive" });
    expect(result).toContain("bg-destructive");
    expect(result).toContain("text-destructive-foreground");
  });

  it("should apply outline variant", () => {
    const result = buttonVariants({ variant: "outline" });
    expect(result).toContain("border");
    expect(result).toContain("border-input");
    expect(result).toContain("bg-background");
  });

  it("should apply secondary variant", () => {
    const result = buttonVariants({ variant: "secondary" });
    expect(result).toContain("bg-secondary");
    expect(result).toContain("text-secondary-foreground");
  });

  it("should apply ghost variant", () => {
    const result = buttonVariants({ variant: "ghost" });
    expect(result).toContain("hover:bg-accent");
    expect(result).toContain("hover:text-accent-foreground");
  });

  it("should apply link variant", () => {
    const result = buttonVariants({ variant: "link" });
    expect(result).toContain("text-primary");
    expect(result).toContain("underline-offset-4");
    expect(result).toContain("hover:underline");
  });

  it("should apply default size", () => {
    const result = buttonVariants({ size: "default" });
    expect(result).toContain("h-10");
    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
  });

  it("should apply small size", () => {
    const result = buttonVariants({ size: "sm" });
    expect(result).toContain("h-9");
    expect(result).toContain("rounded-md");
    expect(result).toContain("px-3");
  });

  it("should apply large size", () => {
    const result = buttonVariants({ size: "lg" });
    expect(result).toContain("h-11");
    expect(result).toContain("rounded-md");
    expect(result).toContain("px-8");
  });

  it("should apply icon size", () => {
    const result = buttonVariants({ size: "icon" });
    expect(result).toContain("h-10");
    expect(result).toContain("w-10");
  });

  it("should combine variant and size", () => {
    const result = buttonVariants({ variant: "destructive", size: "lg" });
    expect(result).toContain("bg-destructive");
    expect(result).toContain("h-11");
    expect(result).toContain("px-8");
  });

  it("should include common button classes", () => {
    const result = buttonVariants();
    expect(result).toContain("inline-flex");
    expect(result).toContain("items-center");
    expect(result).toContain("justify-center");
    expect(result).toContain("whitespace-nowrap");
    expect(result).toContain("rounded-md");
    expect(result).toContain("text-sm");
    expect(result).toContain("font-medium");
    expect(result).toContain("ring-offset-background");
    expect(result).toContain("transition-all");
  });

  it("should include focus-visible classes", () => {
    const result = buttonVariants();
    expect(result).toContain("focus-visible:outline-none");
    expect(result).toContain("focus-visible:ring-2");
    expect(result).toContain("focus-visible:ring-ring");
    expect(result).toContain("focus-visible:ring-offset-2");
  });

  it("should include disabled classes", () => {
    const result = buttonVariants();
    expect(result).toContain("disabled:pointer-events-none");
    expect(result).toContain("disabled:opacity-50");
  });

  it("should include active scale class", () => {
    const result = buttonVariants();
    expect(result).toContain("active:scale-[0.97]");
  });

  it("should include SVG helper classes", () => {
    const result = buttonVariants();
    expect(result).toContain("[&_svg]:pointer-events-none");
    expect(result).toContain("[&_svg]:size-4");
    expect(result).toContain("[&_svg]:shrink-0");
  });
});

describe("button-variants.ts - ButtonVariantProps type", () => {
  it("should export ButtonVariantProps type", () => {
    // Type check - this will compile if type is correct
    const _variantProps: ButtonVariantProps = {
      variant: "default",
      size: "default",
    };
    expect(_variantProps).toBeDefined();
  });

  it("should allow optional variant", () => {
    const _variantProps: ButtonVariantProps = {
      size: "lg",
    };
    expect(_variantProps).toBeDefined();
  });

  it("should allow optional size", () => {
    const _variantProps: ButtonVariantProps = {
      variant: "destructive",
    };
    expect(_variantProps).toBeDefined();
  });

  it("should allow both variant and size", () => {
    const _variantProps: ButtonVariantProps = {
      variant: "outline",
      size: "sm",
    };
    expect(_variantProps).toBeDefined();
  });

  it("should allow undefined for both", () => {
    const _variantProps: ButtonVariantProps = {};
    expect(_variantProps).toBeDefined();
  });
});
