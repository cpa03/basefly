import { describe, it, expect } from "vitest";
import {
  HTTP_STATUS,
  HTTP_STATUS_CATEGORIES,
  isSuccessStatus,
  isRedirectStatus,
  isClientErrorStatus,
  isServerErrorStatus,
  isErrorStatus,
  getStatusCategory,
  HTTP_STATUS_MESSAGES,
  getStatusMessage,
  type HttpStatusCode,
} from "./http";

describe("http", () => {
  describe("HTTP_STATUS", () => {
    it("should have 2xx success codes", () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.ACCEPTED).toBe(202);
      expect(HTTP_STATUS.NO_CONTENT).toBe(204);
    });

    it("should have 3xx redirection codes", () => {
      expect(HTTP_STATUS.MOVED_PERMANENTLY).toBe(301);
      expect(HTTP_STATUS.FOUND).toBe(302);
      expect(HTTP_STATUS.NOT_MODIFIED).toBe(304);
      expect(HTTP_STATUS.TEMPORARY_REDIRECT).toBe(307);
      expect(HTTP_STATUS.PERMANENT_REDIRECT).toBe(308);
    });

    it("should have 4xx client error codes", () => {
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.METHOD_NOT_ALLOWED).toBe(405);
      expect(HTTP_STATUS.CONFLICT).toBe(409);
      expect(HTTP_STATUS.GONE).toBe(410);
      expect(HTTP_STATUS.UNPROCESSABLE_ENTITY).toBe(422);
      expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
    });

    it("should have 5xx server error codes", () => {
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
      expect(HTTP_STATUS.NOT_IMPLEMENTED).toBe(501);
      expect(HTTP_STATUS.BAD_GATEWAY).toBe(502);
      expect(HTTP_STATUS.SERVICE_UNAVAILABLE).toBe(503);
      expect(HTTP_STATUS.GATEWAY_TIMEOUT).toBe(504);
    });
  });

  describe("HTTP_STATUS_CATEGORIES", () => {
    it("should have success category", () => {
      expect(HTTP_STATUS_CATEGORIES.SUCCESS).toContain(200);
      expect(HTTP_STATUS_CATEGORIES.SUCCESS).toContain(201);
      expect(HTTP_STATUS_CATEGORIES.SUCCESS).toContain(204);
    });

    it("should have redirection category", () => {
      expect(HTTP_STATUS_CATEGORIES.REDIRECTION).toContain(301);
      expect(HTTP_STATUS_CATEGORIES.REDIRECTION).toContain(302);
    });

    it("should have client error category", () => {
      expect(HTTP_STATUS_CATEGORIES.CLIENT_ERROR).toContain(400);
      expect(HTTP_STATUS_CATEGORIES.CLIENT_ERROR).toContain(404);
      expect(HTTP_STATUS_CATEGORIES.CLIENT_ERROR).toContain(429);
    });

    it("should have server error category", () => {
      expect(HTTP_STATUS_CATEGORIES.SERVER_ERROR).toContain(500);
      expect(HTTP_STATUS_CATEGORIES.SERVER_ERROR).toContain(503);
    });
  });

  describe("isSuccessStatus", () => {
    it("should return true for 2xx status codes", () => {
      expect(isSuccessStatus(200)).toBe(true);
      expect(isSuccessStatus(201)).toBe(true);
      expect(isSuccessStatus(204)).toBe(true);
    });

    it("should return false for non-2xx status codes", () => {
      expect(isSuccessStatus(400)).toBe(false);
      expect(isSuccessStatus(500)).toBe(false);
      expect(isSuccessStatus(301)).toBe(false);
    });
  });

  describe("isRedirectStatus", () => {
    it("should return true for 3xx status codes", () => {
      expect(isRedirectStatus(301)).toBe(true);
      expect(isRedirectStatus(302)).toBe(true);
      expect(isRedirectStatus(307)).toBe(true);
    });

    it("should return false for non-3xx status codes", () => {
      expect(isRedirectStatus(200)).toBe(false);
      expect(isRedirectStatus(400)).toBe(false);
    });
  });

  describe("isClientErrorStatus", () => {
    it("should return true for 4xx status codes", () => {
      expect(isClientErrorStatus(400)).toBe(true);
      expect(isClientErrorStatus(401)).toBe(true);
      expect(isClientErrorStatus(404)).toBe(true);
      expect(isClientErrorStatus(429)).toBe(true);
    });

    it("should return false for non-4xx status codes", () => {
      expect(isClientErrorStatus(200)).toBe(false);
      expect(isClientErrorStatus(500)).toBe(false);
    });
  });

  describe("isServerErrorStatus", () => {
    it("should return true for 5xx status codes", () => {
      expect(isServerErrorStatus(500)).toBe(true);
      expect(isServerErrorStatus(502)).toBe(true);
      expect(isServerErrorStatus(503)).toBe(true);
    });

    it("should return false for non-5xx status codes", () => {
      expect(isServerErrorStatus(200)).toBe(false);
      expect(isServerErrorStatus(400)).toBe(false);
    });
  });

  describe("isErrorStatus", () => {
    it("should return true for 4xx and 5xx status codes", () => {
      expect(isErrorStatus(400)).toBe(true);
      expect(isErrorStatus(404)).toBe(true);
      expect(isErrorStatus(500)).toBe(true);
      expect(isErrorStatus(503)).toBe(true);
    });

    it("should return false for non-error status codes", () => {
      expect(isErrorStatus(200)).toBe(false);
      expect(isErrorStatus(301)).toBe(false);
    });
  });

  describe("getStatusCategory", () => {
    it("should return SUCCESS for 2xx", () => {
      expect(getStatusCategory(200)).toBe("SUCCESS");
      expect(getStatusCategory(201)).toBe("SUCCESS");
    });

    it("should return REDIRECTION for 3xx", () => {
      expect(getStatusCategory(301)).toBe("REDIRECTION");
      expect(getStatusCategory(302)).toBe("REDIRECTION");
    });

    it("should return CLIENT_ERROR for 4xx", () => {
      expect(getStatusCategory(400)).toBe("CLIENT_ERROR");
      expect(getStatusCategory(404)).toBe("CLIENT_ERROR");
    });

    it("should return SERVER_ERROR for 5xx", () => {
      expect(getStatusCategory(500)).toBe("SERVER_ERROR");
      expect(getStatusCategory(503)).toBe("SERVER_ERROR");
    });

    it("should return UNKNOWN for invalid codes", () => {
      expect(getStatusCategory(199)).toBe("UNKNOWN");
      expect(getStatusCategory(600)).toBe("UNKNOWN");
    });
  });

  describe("HTTP_STATUS_MESSAGES", () => {
    it("should have messages for common status codes", () => {
      expect(HTTP_STATUS_MESSAGES[200]).toBe("OK");
      expect(HTTP_STATUS_MESSAGES[201]).toBe("Created");
      expect(HTTP_STATUS_MESSAGES[404]).toBe("Not Found");
      expect(HTTP_STATUS_MESSAGES[500]).toBe("Internal Server Error");
    });
  });

  describe("getStatusMessage", () => {
    it("should return message for valid status codes", () => {
      expect(getStatusMessage(200)).toBe("OK");
      expect(getStatusMessage(404)).toBe("Not Found");
    });

    it("should return 'Unknown Status' for invalid codes", () => {
      expect(getStatusMessage(999)).toBe("Unknown Status");
      expect(getStatusMessage(199)).toBe("Unknown Status");
    });
  });

  describe("HttpStatusCode type", () => {
    it("should accept valid status codes", () => {
      const code: HttpStatusCode = 200;
      expect(code).toBe(200);
    });
  });
});
