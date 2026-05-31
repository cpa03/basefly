import { describe, expect, it } from "vitest";

import {
  CONTENT_TYPES,
  CUSTOM_HEADERS,
  HEADERS,
  STANDARD_HEADERS,
  TRPC_SOURCE_VALUES,
  type ContentType,
  type CustomHeader,
  type HeaderName,
  type StandardHeader,
  type TrpcSourceValue,
} from "./headers";

describe("headers", () => {
  describe("STANDARD_HEADERS", () => {
    it("should have content-type header", () => {
      expect(STANDARD_HEADERS.CONTENT_TYPE).toBe("Content-Type");
    });

    it("should have authorization header", () => {
      expect(STANDARD_HEADERS.AUTHORIZATION).toBe("Authorization");
    });

    it("should have CORS headers", () => {
      expect(STANDARD_HEADERS.ACCESS_CONTROL_ALLOW_ORIGIN).toBe(
        "Access-Control-Allow-Origin",
      );
      expect(STANDARD_HEADERS.ACCESS_CONTROL_ALLOW_METHODS).toBe(
        "Access-Control-Allow-Methods",
      );
    });

    it("should have security headers", () => {
      expect(STANDARD_HEADERS.X_CONTENT_TYPE_OPTIONS).toBe(
        "X-Content-Type-Options",
      );
      expect(STANDARD_HEADERS.STRICT_TRANSPORT_SECURITY).toBe(
        "Strict-Transport-Security",
      );
      expect(STANDARD_HEADERS.CONTENT_SECURITY_POLICY).toBe(
        "Content-Security-Policy",
      );
    });
  });

  describe("CUSTOM_HEADERS", () => {
    it("should have tRPC headers", () => {
      expect(CUSTOM_HEADERS.X_TRPC_SOURCE).toBe("x-trpc-source");
    });

    it("should have request tracking headers", () => {
      expect(CUSTOM_HEADERS.X_REQUEST_ID).toBe("X-Request-ID");
      expect(CUSTOM_HEADERS.X_CORRELATION_ID).toBe("X-Correlation-ID");
    });

    it("should have client info headers", () => {
      expect(CUSTOM_HEADERS.X_FORWARDED_FOR).toBe("X-Forwarded-For");
      expect(CUSTOM_HEADERS.X_REAL_IP).toBe("X-Real-IP");
    });

    it("should have API versioning headers", () => {
      expect(CUSTOM_HEADERS.X_API_VERSION).toBe("X-API-Version");
    });

    it("should have application metadata headers", () => {
      expect(CUSTOM_HEADERS.X_APP_VERSION).toBe("X-App-Version");
      expect(CUSTOM_HEADERS.X_ENVIRONMENT).toBe("X-Environment");
    });
  });

  describe("TRPC_SOURCE_VALUES", () => {
    it("should have all tRPC source values", () => {
      expect(TRPC_SOURCE_VALUES.CLIENT).toBe("client");
      expect(TRPC_SOURCE_VALUES.RSC).toBe("rsc");
      expect(TRPC_SOURCE_VALUES.SERVER).toBe("server");
      expect(TRPC_SOURCE_VALUES.EDGE).toBe("edge");
    });
  });

  describe("CONTENT_TYPES", () => {
    it("should have common content types", () => {
      expect(CONTENT_TYPES.JSON).toBe("application/json");
      expect(CONTENT_TYPES.HTML).toBe("text/html");
      expect(CONTENT_TYPES.TEXT).toBe("text/plain");
      expect(CONTENT_TYPES.FORM_URLENCODED).toBe(
        "application/x-www-form-urlencoded",
      );
      expect(CONTENT_TYPES.MULTIPART_FORM_DATA).toBe("multipart/form-data");
    });
  });

  describe("HEADERS", () => {
    it("should combine standard and custom headers", () => {
      expect(HEADERS.CONTENT_TYPE).toBe("Content-Type");
      expect(HEADERS.X_TRPC_SOURCE).toBe("x-trpc-source");
    });
  });

  describe("Type exports", () => {
    it("should export StandardHeader type", () => {
      const header: StandardHeader = "Content-Type";
      expect(header).toBe("Content-Type");
    });

    it("should export CustomHeader type", () => {
      const header: CustomHeader = "x-trpc-source";
      expect(header).toBe("x-trpc-source");
    });

    it("should export HeaderName type", () => {
      const header: HeaderName = "Content-Type";
      expect(header).toBe("Content-Type");
    });

    it("should export TrpcSourceValue type", () => {
      const value: TrpcSourceValue = "client";
      expect(value).toBe("client");
    });

    it("should export ContentType type", () => {
      const contentType: ContentType = "application/json";
      expect(contentType).toBe("application/json");
    });
  });
});
