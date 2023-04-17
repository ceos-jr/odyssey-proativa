import type { Roles } from "@utils/constants";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id: string;
      role: Roles;
    } & DefaultSession["user"];
  }
  interface User {
    role: Roles;
  }
}
