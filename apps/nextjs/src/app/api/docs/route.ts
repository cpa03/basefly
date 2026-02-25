import { openApiDocument } from "@saasfly/api/openapi";

/**
 * OpenAPI specification endpoint.
 *
 * Returns the OpenAPI 3.0 specification for the Basefly API.
 * This can be used with:
 * - Swagger UI
 * - ReDoc
 * - API clients (curl, Postman, etc.)
 *
 * GET /api/docs
 */
export function GET() {
  return Response.json(openApiDocument, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
