import { getSessionUser, isClerkEnabled } from "./clerk";
import { logger } from "./logger";

export { isClerkEnabled, logger };

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

declare global {
  interface CustomJwtSessionClaims {
    user?: User & {
      id: string;
      isAdmin: boolean;
    };
  }
}

export const authOptions = {
  pages: {
    signIn: "/login",
  },
};

export async function getCurrentUser() {
  return await getSessionUser();
}
