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
  getModSuggestions: adminProcedure.query(({ ctx }) => {
    /*
    - getSuggestions: Pede para o banco de dados encontrar* um grupo de sugestões aos módulos com informações adcionais
      sobre quem as fez e quais modulos elas se referem e retorna esse valor.
    */
    return ctx.prisma.modSuggestion.findMany({
      include: {
        module: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, image: true } },
      },
      /*
        *-> Nesse caso os valores requisitados são todas as sugestões aos modulos juntamente com o nome e id do modulo
          em questão e nome, id e imagem do usuario que fez a sugestão. 
      */
    });
  }),
});
