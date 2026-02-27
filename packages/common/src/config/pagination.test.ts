import { describe, it, expect } from "vitest";
import {
  PAGE_SIZES,
  PAGINATION_LIMITS,
  INFINITE_SCROLL,
  PAGINATION_CONFIG,
  getPageSize,
  validatePageSize,
  calculateOffset,
  calculateTotalPages,
  generatePaginationMeta,
  type PageSizeKey,
} from "./pagination";

describe("pagination", () => {
  describe("PAGE_SIZES", () => {
    it("should have default page size", () => {
      expect(PAGE_SIZES.default).toBe(20);
    });

    it("should have various page sizes", () => {
      expect(PAGE_SIZES.small).toBe(10);
      expect(PAGE_SIZES.medium).toBe(20);
      expect(PAGE_SIZES.large).toBe(50);
      expect(PAGE_SIZES.max).toBe(100);
    });

    it("should have specialized page sizes", () => {
      expect(PAGE_SIZES.search).toBe(10);
      expect(PAGE_SIZES.admin).toBe(25);
      expect(PAGE_SIZES.mobile).toBe(10);
    });
  });

  describe("PAGINATION_LIMITS", () => {
    it("should have max visible pages", () => {
      expect(PAGINATION_LIMITS.maxVisiblePages).toBe(5);
    });

    it("should have max items per request", () => {
      expect(PAGINATION_LIMITS.maxItemsPerRequest).toBe(100);
    });

    it("should have max offset", () => {
      expect(PAGINATION_LIMITS.maxOffset).toBe(10000);
    });
  });

  describe("INFINITE_SCROLL", () => {
    it("should have batch size", () => {
      expect(INFINITE_SCROLL.batchSize).toBe(20);
    });

    it("should have threshold", () => {
      expect(INFINITE_SCROLL.threshold).toBe(200);
    });

    it("should have max items", () => {
      expect(INFINITE_SCROLL.maxItems).toBe(500);
    });
  });

  describe("PAGINATION_CONFIG", () => {
    it("should combine all pagination configs", () => {
      expect(PAGINATION_CONFIG.pageSizes).toBe(PAGE_SIZES);
      expect(PAGINATION_CONFIG.limits).toBe(PAGINATION_LIMITS);
      expect(PAGINATION_CONFIG.infiniteScroll).toBe(INFINITE_SCROLL);
    });
  });

  describe("getPageSize", () => {
    it("should return size for valid key", () => {
      expect(getPageSize("default")).toBe(20);
      expect(getPageSize("small")).toBe(10);
      expect(getPageSize("large")).toBe(50);
    });

    it("should return default for invalid key", () => {
      expect(getPageSize("invalid" as PageSizeKey)).toBe(20);
    });

    it("should return default when no key provided", () => {
      expect(getPageSize()).toBe(20);
    });
  });

  describe("validatePageSize", () => {
    it("should return valid sizes unchanged", () => {
      expect(validatePageSize(10)).toBe(10);
      expect(validatePageSize(25)).toBe(25);
      expect(validatePageSize(50)).toBe(50);
    });

    it("should return default for sizes less than 1", () => {
      expect(validatePageSize(0)).toBe(20);
      expect(validatePageSize(-1)).toBe(20);
    });

    it("should cap sizes exceeding max", () => {
      expect(validatePageSize(200)).toBe(100);
    });
  });

  describe("calculateOffset", () => {
    it("should calculate correct offset", () => {
      expect(calculateOffset(1, 20)).toBe(0);
      expect(calculateOffset(2, 20)).toBe(20);
      expect(calculateOffset(3, 20)).toBe(40);
    });

    it("should handle page 1 with different sizes", () => {
      expect(calculateOffset(1, 10)).toBe(0);
      expect(calculateOffset(1, 50)).toBe(0);
    });

    it("should handle page 0 as page 1", () => {
      expect(calculateOffset(0, 20)).toBe(0);
    });

    it("should handle negative pages", () => {
      expect(calculateOffset(-1, 20)).toBe(0);
    });
  });

  describe("calculateTotalPages", () => {
    it("should calculate total pages correctly", () => {
      expect(calculateTotalPages(0, 20)).toBe(0);
      expect(calculateTotalPages(1, 20)).toBe(1);
      expect(calculateTotalPages(20, 20)).toBe(1);
      expect(calculateTotalPages(21, 20)).toBe(2);
      expect(calculateTotalPages(100, 20)).toBe(5);
    });

    it("should handle exact division", () => {
      expect(calculateTotalPages(40, 20)).toBe(2);
      expect(calculateTotalPages(60, 20)).toBe(3);
    });

    it("should return 0 for less than 1 item", () => {
      expect(calculateTotalPages(-1, 20)).toBe(0);
    });
  });

  describe("generatePaginationMeta", () => {
    it("should generate correct pagination metadata", () => {
      const meta = generatePaginationMeta(50, 1, 20);
      expect(meta.currentPage).toBe(1);
      expect(meta.pageSize).toBe(20);
      expect(meta.totalItems).toBe(50);
      expect(meta.totalPages).toBe(3);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPreviousPage).toBe(false);
      expect(meta.nextPage).toBe(2);
      expect(meta.startItem).toBe(1);
      expect(meta.endItem).toBe(20);
    });

    it("should handle last page correctly", () => {
      const meta = generatePaginationMeta(50, 3, 20);
      expect(meta.currentPage).toBe(3);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPreviousPage).toBe(true);
      expect(meta.nextPage).toBeNull();
      expect(meta.previousPage).toBe(2);
      expect(meta.startItem).toBe(41);
      expect(meta.endItem).toBe(50);
    });

    it("should clamp current page to valid range", () => {
      const meta = generatePaginationMeta(50, 100, 20);
      expect(meta.currentPage).toBe(3); // clamped to totalPages
    });

    it("should handle empty results", () => {
      const meta = generatePaginationMeta(0, 1, 20);
      expect(meta.totalPages).toBe(0);
      expect(meta.hasNextPage).toBe(false);
      expect(meta.startItem).toBe(0);
      expect(meta.endItem).toBe(0);
    });
  });
});
