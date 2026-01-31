import { createKysely } from "@vercel/postgres-kysely";

import type { DB } from "./prisma/types.js";

export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export * from "./prisma/types.js";
export * from "./prisma/enums.js";
export * from "./soft-delete";
export * from "./user-deletion";

export const db = createKysely<DB>();
