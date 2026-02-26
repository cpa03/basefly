import { generateOpenApiDocument } from "trpc-openapi";

import { appRouter } from "./root";

/**
 * OpenAPI 3.0 specification for the Basefly API.
 *
 * This document provides a machine-readable description of the API
 * endpoints, including request/response schemas and authentication requirements.
 *
 * Access via:
 * - JSON: GET /api/docs
 * - Swagger UI: /api/docs (when swagger-ui is installed)
 *
 * @example
 * ```bash
 * curl https://your-domain.com/api/docs
 * ```
 */
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Basefly API",
  description:
    "Enterprise-grade SaaS API for Kubernetes cluster management with subscription billing",
  version: "1.0.0",
  baseUrl: "/api/trpc",
  docsUrl: "https://docs.saasfly.io",
});
