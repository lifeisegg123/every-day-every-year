import * as trpcNext from "@trpc/server/adapters/next";
import { appRouter } from "src/libs/server/trpc";
import { createContext } from "src/libs/server/trpc/context";

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});
