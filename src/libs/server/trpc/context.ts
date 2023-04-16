import { inferAsyncReturnType } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { getExtendedSession } from "../auth";
import { prisma } from "../prisma";

export const createContext = async ({
  req,
  res,
}: trpcNext.CreateNextContextOptions) => {
  if (req && res) {
    const session = await getExtendedSession(req, res, authOptions);
    return { session, prisma };
  }
  return { prisma };
};
export type Context = inferAsyncReturnType<typeof createContext>;
