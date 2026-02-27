/**
 * API Documentation Generator
 *
 * This script generates markdown documentation from the tRPC OpenAPI specification.
 * It extracts endpoint information and creates human-readable documentation with
 * curl examples.
 *
 * Usage:
 *   pnpm --filter @saasfly/api run generate-docs
 *
 * Output:
 *   - docs/api.md - Full API documentation
 */

import { openApiDocument } from "./openapi";

interface Parameter {
  name: string;
  in: string;
  required?: boolean;
  schema?: {
    type: string;
    format?: string;
    description?: string;
    enum?: string[];
  };
  description?: string;
}

interface RequestBody {
  content?: {
    "application/json"?: {
      schema?: Record<string, unknown>;
    };
  };
  required?: boolean;
}

interface Response {
  description: string;
  content?: {
    "application/json"?: {
      schema?: Record<string, unknown>;
    };
  };
}

interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses?: Record<string, Response>;
}

interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTypeString(schema: Record<string, unknown> | undefined): string {
  if (!schema) return "any";
  if (schema.$ref) {
    return schema.$ref.split("/").pop() || "unknown";
  }
  if (schema.type === "array" && schema.items) {
    return `${getTypeString(schema.items as Record<string, unknown>)}[]`;
  }
  if (schema.type === "object" && schema.properties) {
    const props = Object.entries(schema.properties as Record<string, unknown>)
      .map(([key, val]) => `${key}: ${getTypeString(val as Record<string, unknown>)}`)
      .join(", ");
    return `{ ${props} }`;
  }
  return (schema.type as string) || "unknown";
}

function generateCurlExample(
  path: string,
  method: string,
  operation: Operation
): string {
  const baseUrl = openApiDocument.servers?.[0]?.url || "/api/trpc";
  const endpoint = path.replace("/{", "/:").replace("}", "");
  const url = `${baseUrl}${endpoint}`;

  let curl = `curl -X ${method.toUpperCase()} "${url}"`;

  // Add headers
  curl += ` \\\n  -H "Content-Type: application/json"`;
  curl += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`;

  // Add request body if present
  if (operation.requestBody?.content?.["application/json"]?.schema) {
    const schema = operation.requestBody.content["application/json"].schema;
    if ("$ref" in schema) {
      const exampleName = (schema.$ref as string).split("/").pop();
      curl += ` \\\n  -d '{ "${exampleName}": { ... } }'`;
    } else if (schema.type === "object" && schema.properties) {
      const example = Object.keys(schema.properties)
        .map((key) => `  "${key}": "value"`)
        .join(",\n");
      curl += ` \\\n  -d '{\n${example}\n}'`;
    }
  }

  return curl;
}

function generateTypeScriptExample(
  path: string,
  method: string,
  operation: Operation
): string {
  const endpoint = path.replace("/{", "/:").replace("}", "");
  let example = `// Using tRPC client\n`;

  const inputType = operation.operationId
    ? operation.operationId.replace(/^(get|post|put|delete|patch)_/, "")
    : "input";

  if (method.toLowerCase() === "get") {
    example += `const result = await trpc.${endpoint
      .split("/")
      .filter(Boolean)
      .join(".")}.query({\n  ${inputType}: {}\n});`;
  } else {
    example += `const result = await trpc.${endpoint
      .split("/")
      .filter(Boolean)
      .join(".")}.mutate({\n  ${inputType}: {}\n});`;
  }

  return example;
}

function generateMarkdown(): string {
  const doc = openApiDocument;
  let markdown = `# ${doc.title}\n\n`;
  markdown += `${doc.description}\n\n`;
  markdown += `**Version**: ${doc.version}\n\n`;
  markdown += `---\n\n`;

  // Group operations by tag
  const pathsByTag: Record<string, { path: string; method: string; op: Operation }[]> = {};

  for (const [path, pathItem] of Object.entries(doc.paths || {})) {
    const item = pathItem as PathItem;
    for (const [method, operation] of Object.entries(item)) {
      if (["get", "post", "put", "delete", "patch"].includes(method)) {
        const op = operation as Operation;
        const tags = op.tags || ["Other"];
        for (const tag of tags) {
          if (!pathsByTag[tag]) pathsByTag[tag] = [];
          pathsByTag[tag].push({ path, method, op });
        }
      }
    }
  }

  // Generate documentation for each tag
  for (const [tag, operations] of Object.entries(pathsByTag)) {
    markdown += `## ${capitalizeFirst(tag)}\n\n`;

    for (const { path, method, op } of operations) {
      markdown += `### ${op.summary || op.operationId || `${method} ${path}`}\n\n`;

      if (op.description) {
        markdown += `${op.description}\n\n`;
      }

      markdown += `**Endpoint**: \`${method.toUpperCase()} ${path}\`\n\n`;

      if (op.operationId) {
        markdown += `**Operation ID**: \`${op.operationId}\`\n\n`;
      }

      // Parameters
      if (op.parameters && op.parameters.length > 0) {
        markdown += `#### Parameters\n\n`;
        markdown += `| Name | Location | Type | Required | Description |\n`;
        markdown += `|------|----------|------|----------|-------------|\n`;
        for (const param of op.parameters) {
          const type = param.schema?.type || "string";
          const required = param.required ? "Yes" : "No";
          markdown += `| \`${param.name}\` | ${param.in} | ${type} | ${required} | ${param.description || "-"} |\n`;
        }
        markdown += `\n`;
      }

      // Request body
      if (op.requestBody) {
        markdown += `#### Request Body\n\n`;
        if (op.requestBody.content?.["application/json"]?.schema) {
          const schema = op.requestBody.content["application/json"].schema;
          if ("$ref" in schema) {
            markdown += `**Type**: \`${(schema.$ref as string).split("/").pop()}\`\n\n`;
          } else {
            markdown += `**Type**: \`${getTypeString(schema)}\`\n\n`;
          }
        }
      }

      // Response
      if (op.responses) {
        markdown += `#### Responses\n\n`;
        for (const [code, response] of Object.entries(op.responses)) {
          markdown += `- **${code}**: ${response.description}\n`;
        }
        markdown += `\n`;
      }

      // Examples
      markdown += `#### Examples\n\n`;
      markdown += `**cURL**\n\n`;
      markdown += "```bash\n";
      markdown += generateCurlExample(path, method, op);
      markdown += "\n```\n\n";

      markdown += `**TypeScript**\n\n`;
      markdown += "```typescript\n";
      markdown += generateTypeScriptExample(path, method, op);
      markdown += "\n```\n\n";

      markdown += `---\n\n`;
    }
  }

  return markdown;
}

// Generate and output
const markdown = generateMarkdown();
console.log(markdown);
