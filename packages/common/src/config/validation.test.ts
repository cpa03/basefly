import { describe, expect, it } from "vitest";

import {
  API_VALIDATION,
  CLUSTER_VALIDATION,
  ORG_VALIDATION,
  PAGINATION_VALIDATION,
  PLAN_VALIDATION,
  USER_VALIDATION,
  VALIDATION,
} from "./validation";

describe("validation.ts - USER_VALIDATION", () => {
  it("should have username constraints", () => {
    expect(USER_VALIDATION.username).toBeDefined();
    expect(USER_VALIDATION.username.minLength).toBe(3);
    expect(USER_VALIDATION.username.maxLength).toBe(32);
    expect(USER_VALIDATION.username.pattern).toBeInstanceOf(RegExp);
    expect(USER_VALIDATION.username.patternMessage).toBeDefined();
  });

  it("should have displayName constraints", () => {
    expect(USER_VALIDATION.displayName).toBeDefined();
    expect(USER_VALIDATION.displayName.minLength).toBe(1);
    expect(USER_VALIDATION.displayName.maxLength).toBe(100);
  });

  it("should have email constraints", () => {
    expect(USER_VALIDATION.email).toBeDefined();
    expect(USER_VALIDATION.email.maxLength).toBe(255);
  });

  it("should have password constraints", () => {
    expect(USER_VALIDATION.password).toBeDefined();
    expect(USER_VALIDATION.password.minLength).toBe(8);
    expect(USER_VALIDATION.password.maxLength).toBe(128);
    expect(USER_VALIDATION.password.requireUppercase).toBe(true);
    expect(USER_VALIDATION.password.requireLowercase).toBe(true);
    expect(USER_VALIDATION.password.requireNumber).toBe(true);
    expect(USER_VALIDATION.password.requireSpecial).toBe(false);
  });

  it("should have bio constraints", () => {
    expect(USER_VALIDATION.bio).toBeDefined();
    expect(USER_VALIDATION.bio.maxLength).toBe(500);
  });
});

describe("validation.ts - CLUSTER_VALIDATION", () => {
  it("should have name constraints", () => {
    expect(CLUSTER_VALIDATION.name).toBeDefined();
    expect(CLUSTER_VALIDATION.name.minLength).toBe(1);
    expect(CLUSTER_VALIDATION.name.maxLength).toBe(100);
    expect(CLUSTER_VALIDATION.name.pattern).toBeInstanceOf(RegExp);
    expect(CLUSTER_VALIDATION.name.patternMessage).toBeDefined();
  });

  it("should have displayName constraints", () => {
    expect(CLUSTER_VALIDATION.displayName).toBeDefined();
    expect(CLUSTER_VALIDATION.displayName.minLength).toBe(2);
    expect(CLUSTER_VALIDATION.displayName.maxLength).toBe(32);
  });

  it("should have location constraints", () => {
    expect(CLUSTER_VALIDATION.location).toBeDefined();
    expect(CLUSTER_VALIDATION.location.minLength).toBe(1);
    expect(CLUSTER_VALIDATION.location.maxLength).toBe(50);
  });

  it("should have description constraints", () => {
    expect(CLUSTER_VALIDATION.description).toBeDefined();
    expect(CLUSTER_VALIDATION.description.maxLength).toBe(500);
  });

  it("should have tags constraints", () => {
    expect(CLUSTER_VALIDATION.tags).toBeDefined();
    expect(CLUSTER_VALIDATION.tags.maxCount).toBe(10);
    expect(CLUSTER_VALIDATION.tags.maxLength).toBe(50);
  });
});

describe("validation.ts - ORG_VALIDATION", () => {
  it("should have name constraints", () => {
    expect(ORG_VALIDATION.name).toBeDefined();
    expect(ORG_VALIDATION.name.minLength).toBe(1);
    expect(ORG_VALIDATION.name.maxLength).toBe(100);
  });

  it("should have slug constraints", () => {
    expect(ORG_VALIDATION.slug).toBeDefined();
    expect(ORG_VALIDATION.slug.minLength).toBe(2);
    expect(ORG_VALIDATION.slug.maxLength).toBe(50);
    expect(ORG_VALIDATION.slug.pattern).toBeInstanceOf(RegExp);
  });
});

describe("validation.ts - PLAN_VALIDATION", () => {
  it("should have id constraints", () => {
    expect(PLAN_VALIDATION.id).toBeDefined();
    expect(PLAN_VALIDATION.id.minLength).toBe(1);
    expect(PLAN_VALIDATION.id.maxLength).toBe(50);
  });

  it("should have name constraints", () => {
    expect(PLAN_VALIDATION.name).toBeDefined();
    expect(PLAN_VALIDATION.name.minLength).toBe(1);
    expect(PLAN_VALIDATION.name.maxLength).toBe(100);
  });
});

describe("validation.ts - API_VALIDATION", () => {
  it("should have text input constraints", () => {
    expect(API_VALIDATION.text).toBeDefined();
    expect(API_VALIDATION.text.minLength).toBe(1);
    expect(API_VALIDATION.text.maxLength).toBe(1000);
  });

  it("should have longText constraints", () => {
    expect(API_VALIDATION.longText).toBeDefined();
    expect(API_VALIDATION.longText.maxLength).toBe(10000);
  });

  it("should have search constraints", () => {
    expect(API_VALIDATION.search).toBeDefined();
    expect(API_VALIDATION.search.minLength).toBe(2);
    expect(API_VALIDATION.search.maxLength).toBe(200);
  });

  it("should have id constraints", () => {
    expect(API_VALIDATION.id).toBeDefined();
    expect(API_VALIDATION.id.minLength).toBe(1);
    expect(API_VALIDATION.id.maxLength).toBe(100);
  });
});

describe("validation.ts - PAGINATION_VALIDATION", () => {
  it("should have page constraints", () => {
    expect(PAGINATION_VALIDATION.page).toBeDefined();
    expect(PAGINATION_VALIDATION.page.min).toBe(1);
    expect(PAGINATION_VALIDATION.page.max).toBe(10000);
  });

  it("should have pageSize constraints", () => {
    expect(PAGINATION_VALIDATION.pageSize).toBeDefined();
    expect(PAGINATION_VALIDATION.pageSize.min).toBe(1);
    expect(PAGINATION_VALIDATION.pageSize.max).toBe(100);
  });
});

describe("validation.ts - VALIDATION export", () => {
  it("should export all validation configs", () => {
    expect(VALIDATION.user).toBeDefined();
    expect(VALIDATION.cluster).toBeDefined();
    expect(VALIDATION.organization).toBeDefined();
    expect(VALIDATION.plan).toBeDefined();
    expect(VALIDATION.api).toBeDefined();
    expect(VALIDATION.pagination).toBeDefined();
  });

  it("should have correct references to sub-configs", () => {
    expect(VALIDATION.user).toBe(USER_VALIDATION);
    expect(VALIDATION.cluster).toBe(CLUSTER_VALIDATION);
    expect(VALIDATION.organization).toBe(ORG_VALIDATION);
    expect(VALIDATION.plan).toBe(PLAN_VALIDATION);
    expect(VALIDATION.api).toBe(API_VALIDATION);
    expect(VALIDATION.pagination).toBe(PAGINATION_VALIDATION);
  });
});

describe("validation.ts - Type exports", () => {
  it("should export UserValidation type", () => {
    // Type check - this will compile if type is correct
    const _userValidation: typeof USER_VALIDATION = USER_VALIDATION;
    expect(_userValidation).toBeDefined();
  });

  it("should export ClusterValidation type", () => {
    const _clusterValidation: typeof CLUSTER_VALIDATION = CLUSTER_VALIDATION;
    expect(_clusterValidation).toBeDefined();
  });

  it("should export OrganizationValidation type", () => {
    const _orgValidation: typeof ORG_VALIDATION = ORG_VALIDATION;
    expect(_orgValidation).toBeDefined();
  });

  it("should export PlanValidation type", () => {
    const _planValidation: typeof PLAN_VALIDATION = PLAN_VALIDATION;
    expect(_planValidation).toBeDefined();
  });

  it("should export ApiValidation type", () => {
    const _apiValidation: typeof API_VALIDATION = API_VALIDATION;
    expect(_apiValidation).toBeDefined();
  });

  it("should export PaginationValidation type", () => {
    const _paginationValidation: typeof PAGINATION_VALIDATION =
      PAGINATION_VALIDATION;
    expect(_paginationValidation).toBeDefined();
  });

  it("should export ValidationConfig type", () => {
    const _validationConfig: typeof VALIDATION = VALIDATION;
    expect(_validationConfig).toBeDefined();
  });
});
