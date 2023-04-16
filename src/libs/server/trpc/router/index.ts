import { router } from "../trpc";
import { answersRouter } from "./answers";
import { questionsRouter } from "./questions";
import { usersRouter } from "./users";

export const appRouter = router({
  questions: questionsRouter,
  users: usersRouter,
  answers: answersRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
