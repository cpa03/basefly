export const PAGE_SIZES = {
  default: 20,
  small: 10,
  medium: 20,
  large: 50,
  max: 100,
  dropdown: 50,
  search: 10,
  admin: 25,
  mobile: 10,
} as const;

export const PAGINATION_LIMITS = {
  maxVisiblePages: 5,
  maxItemsPerRequest: 100,
  maxOffset: 10000,
  cursorWindow: 20,
} as const;

export const INFINITE_SCROLL = {
  batchSize: 20,
  threshold: 200,
  maxItems: 500,
  debounceMs: 150,
} as const;

export const PAGINATION_CONFIG = {
  pageSizes: PAGE_SIZES,
  limits: PAGINATION_LIMITS,
  infiniteScroll: INFINITE_SCROLL,
} as const;

export type PageSizeKey = keyof typeof PAGE_SIZES;

export function getPageSize(key: PageSizeKey = "default"): number {
  return PAGE_SIZES[key];
}

export function validatePageSize(size: number): number {
  const { maxItemsPerRequest } = PAGINATION_LIMITS;

  if (size < 1) return PAGE_SIZES.default;
  if (size > maxItemsPerRequest) return maxItemsPerRequest;
  return size;
}

export function calculateOffset(page: number, pageSize: number): number {
  const validPage = Math.max(1, page);
  return (validPage - 1) * pageSize;
}

export function calculateTotalPages(
  totalItems: number,
  pageSize: number,
): number {
  if (totalItems < 1) return 0;
  return Math.ceil(totalItems / pageSize);
}

export function generatePaginationMeta(
  totalItems: number,
  currentPage: number,
  pageSize: number,
) {
  const totalPages = calculateTotalPages(totalItems, pageSize);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

  return {
    currentPage: validCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: validCurrentPage < totalPages,
    hasPreviousPage: validCurrentPage > 1,
    nextPage: validCurrentPage < totalPages ? validCurrentPage + 1 : null,
    previousPage: validCurrentPage > 1 ? validCurrentPage - 1 : null,
    startItem: totalItems > 0 ? (validCurrentPage - 1) * pageSize + 1 : 0,
    endItem: Math.min(validCurrentPage * pageSize, totalItems),
  };
}
