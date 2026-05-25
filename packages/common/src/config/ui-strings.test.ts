import { describe, it, expect, expectTypeOf } from "vitest";
import {
  UI_STRINGS,
  THEME_STRINGS,
  MARKETING_FALLBACKS,
  PAGE_METADATA,
  MARKETING_STATS,
  ERROR_MESSAGES,
  UI_LABELS,
  PLACEHOLDER_TEXT,
  TOAST_MESSAGES,
  FORM_LABELS,
  FORM_DESCRIPTIONS,
  DIALOG_MESSAGES,
} from "./ui-strings";

describe("ui-strings", () => {
  describe("UI_STRINGS", () => {
    it("should have login and signup strings", () => {
      expect(UI_STRINGS.login).toBe("Default Login Text");
      expect(UI_STRINGS.signup).toBe("Default Signup Text");
    });

    it("should be readonly (as const)", () => {
      expectTypeOf(UI_STRINGS.login).toBeString();
    });
  });

  describe("THEME_STRINGS", () => {
    it("should have light, dark, and system strings", () => {
      expect(THEME_STRINGS.light).toBe("Light");
      expect(THEME_STRINGS.dark).toBe("Dark");
      expect(THEME_STRINGS.system).toBe("System");
    });
  });

  describe("MARKETING_FALLBACKS", () => {
    it("should have title and subtitle", () => {
      expect(MARKETING_FALLBACKS.title).toContain("Ship your apps");
      expect(MARKETING_FALLBACKS.subtitle).toBeTruthy();
    });
  });

  describe("PAGE_METADATA", () => {
    it("should have pricing metadata", () => {
      expect(PAGE_METADATA.pricing).toBe("Pricing");
    });
  });

  describe("MARKETING_STATS", () => {
    it("should have contributor and developer counts", () => {
      expect(MARKETING_STATS.contributorCount).toBe(9);
      expect(MARKETING_STATS.developerCount).toBe(2000);
    });
  });

  describe("ERROR_MESSAGES", () => {
    it("should have error message strings", () => {
      expect(ERROR_MESSAGES.patternGeneration).toBeTruthy();
      expect(ERROR_MESSAGES.somethingWentWrong).toBe("Something went wrong.");
      expect(ERROR_MESSAGES.genericError).toBe("Error");
    });
  });

  describe("UI_LABELS", () => {
    it("should have loading and search labels", () => {
      expect(UI_LABELS.loading).toBe("Loading...");
      expect(UI_LABELS.search).toBe("Search");
      expect(UI_LABELS.searchPlaceholder).toBe("Search...");
    });

    it("should have mobile navigation labels", () => {
      expect(UI_LABELS.mobileMenu).toBe("Menu");
      expect(UI_LABELS.openMobileMenu).toBe("Open menu");
      expect(UI_LABELS.closeMobileMenu).toBe("Close menu");
    });

    it("should have blog labels", () => {
      expect(UI_LABELS.readMore).toBe("Read More");
      expect(UI_LABELS.blogPosts).toBe("Blog Posts");
    });
  });

  describe("PLACEHOLDER_TEXT", () => {
    it("should have cluster name and region placeholders", () => {
      expect(PLACEHOLDER_TEXT.clusterName).toBe("Name of your cluster");
      expect(PLACEHOLDER_TEXT.selectRegion).toBe("Select a region");
    });
  });

  describe("TOAST_MESSAGES", () => {
    it("should have success messages", () => {
      expect(TOAST_MESSAGES.success.saved).toBe("Your changes have been saved.");
      expect(TOAST_MESSAGES.success.clusterCreated).toBe(
        "Your cluster has been created."
      );
    });

    it("should have error messages", () => {
      expect(TOAST_MESSAGES.error.somethingWentWrong).toBe(
        "Something went wrong."
      );
      expect(TOAST_MESSAGES.error.pleaseTryAgain).toBe("Please try again.");
    });
  });

  describe("FORM_LABELS", () => {
    it("should have common form labels", () => {
      expect(FORM_LABELS.name).toBe("Name");
      expect(FORM_LABELS.save).toBe("Save");
      expect(FORM_LABELS.cancel).toBe("Cancel");
      expect(FORM_LABELS.delete).toBe("Delete");
    });

    it("should have subscription-related labels", () => {
      expect(FORM_LABELS.subscriptionPlan).toBe("Subscription Plan");
      expect(FORM_LABELS.upgradeToPro).toBe("Upgrade to PRO");
    });
  });

  describe("FORM_DESCRIPTIONS", () => {
    it("should have form descriptions", () => {
      expect(FORM_DESCRIPTIONS.enterName).toContain("full name");
      expect(FORM_DESCRIPTIONS.createCluster).toContain("k8s cluster");
    });
  });

  describe("DIALOG_MESSAGES", () => {
    it("should have delete cluster dialog messages", () => {
      expect(DIALOG_MESSAGES.deleteCluster.title).toBe(
        "Are you sure you want to delete this cluster?"
      );
      expect(DIALOG_MESSAGES.deleteCluster.description).toBe(
        "This action cannot be undone."
      );
    });
  });
});
