import { adminProcedure, router } from "@trpc/trpc";
import { z } from "zod";

export const moduleSuggestion = router({
  allByModuleId: adminProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.modSuggestion.findMany({
      where: { moduleId: input },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
  }),
});
