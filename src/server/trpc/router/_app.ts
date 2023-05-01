import { router } from "../trpc";
import { adminRouter } from "./admin";
import { authRouter } from "./auth";
import { gradesRouter } from "./grades";
import { lessonRouter } from "./lesson";
import { moduleRouter } from "./modules";
import { moduleSuggestion } from "./mod_sug";
import { taskRouter } from "./task";
import { userRouter } from "./user";

export const appRouter = router({
  module: moduleRouter,
  lesson: lessonRouter,
  auth: authRouter,
  user: userRouter,
  admin: adminRouter,
  task: taskRouter,
  grades: gradesRouter,
  modSug: moduleSuggestion,
});

// export type definition of API
export type AppRouter = typeof appRouter;
