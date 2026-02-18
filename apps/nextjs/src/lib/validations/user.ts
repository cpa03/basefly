import * as z from "zod";

import { USER_VALIDATION } from "@saasfly/common";

export const userNameSchema = z.object({
  name: z
    .string()
    .min(USER_VALIDATION.username.minLength)
    .max(USER_VALIDATION.username.maxLength),
});
