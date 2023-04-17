import { getMockUser } from "@utils/mock-user";
import { type GetServerSidePropsContext } from "next";
import { unstable_getServerSession } from "next-auth";
import { getMockRole } from "src/pages/api/mock-role";
import { authOptions } from "../../pages/api/auth/[...nextauth]";

/**
 * Wrapper for unstable_getServerSession https://next-auth.js.org/configuration/nextjs
 * See example usage in trpc createContext or the restricted API route
 */

export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  if (process.env.NEXT_PUBLIC_MOCK_NEXT_AUTH === "true") {
    const role = await getMockRole();
    if (role !== null) {
      return { user: getMockUser(role), expires: "77777" };
    } else return null;
  } else return await unstable_getServerSession(ctx.req, ctx.res, authOptions);
};
