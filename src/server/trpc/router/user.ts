/*Importações: LessSuggestionSchema é o esquema responsável pela sugestões de tarefas. SuggestionFormSchema é o formulário responsável pela sugestão de tarefas. TaskStatus é o dado pra validar o status da tarefa. 'z' é uma biblioteca para validação de dados que valida os parâmetros dos endpoints. */
import { LessSuggestionSchema } from "@components/Layout/LessSuggestionModal";
import { TaskStatus } from "@utils/constants";
import { z } from "zod";

/*Importações: Funções e tipos definidos pelo tRPC que vão ser utilizados nos endpoints. */
import { router, protectedProcedure } from "../trpc";

/* userRouter é um objeto com os endpoints getMostRecentMod, getUnfMod, etc. Para lidar com as requisições referentes ao usuário.*/
export const userRouter = router({
  /* O endpoint getMostRecentMod recebe como parâmeto um número e usa a função findMany do Prisma para buscar um módulo referente a esse ID que foi o último visitado. */
  getMostRecentMod: protectedProcedure
    .input(z.number())
    .query(({ ctx, input }) => {
      return ctx.prisma.userModuleProgress.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          module: { select: { name: true, description: true } },
          lessonProg: { select: { completed: true } },
        },
        orderBy: { lastTimeSeen: "desc" },
        take: input,
      });
    }),
  /* O endpoint getUnfMod utiliza a função findMany do Prisma para verificar o progresso do usuário e retorna os módulos que ainda não foram utilizados. É um processo protegido, isso afeta apenas o usuário logado.*/
  getUnfMod: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userModuleProgress.findMany({
      where: { userId: ctx.session.user.id, completed: false },
      include: {
        module: { select: { name: true, description: true } },
        lessonProg: { select: { completed: true } },
      },
      orderBy: { lastTimeSeen: "desc" },
    });
  }),
  /* O endpoint getCompMod utiliza a função findMany do Prisma para verificar o progresso do usuário e retorna os módulos que já foram completos. É um processo protegido, isso afeta apenas o usuário logado. */
  getCompMod: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userModuleProgress.findMany({
      where: { userId: ctx.session.user.id, completed: true },
      include: {
        module: { select: { name: true, description: true } },
        lessonProg: { select: { completed: true } },
      },
      orderBy: { lastTimeSeen: "desc" },
    });
  }),
  /* O endpoint getModProg recebe como parâmetro uma string, a qual é validada pela biblioteca 'zod' e utiliza a função findUnique do Prisma para verificar um módulo específico e retornar o progresso do usuário nesse módulo. 
  É um processo protegido, apenas afeta o usuário logado. */
  getModProg: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.userModuleProgress.findUnique({
      where: {
        userId_moduleId: { userId: ctx.session.user.id, moduleId: input },
      },
    });
  }),
  /*O endpoint getTaskProg recebe como um parâmetro uma string, a qual é validada pela biblioteca 'zod' e utiliza a função findUnique do Prisma para verificar uma tarefa específica e retornar o progresso do usuário nessa tarefa.
  É um processo protegido, apenas afeta o usuário logado. */
  getTaskProg: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.userTaskProgress.findUnique({
      where: { userId_taskId: { userId: ctx.session.user.id, taskId: input } },
    });
  }),
  /*O endpoint getNumModInProg verifica o número do módulo em progresso por meio da função 'count'. É um processo protegido, afeta apenas o usuário logado. */
  getNumModInProg: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userModuleProgress.count({
      where: { userId: ctx.session.user.id, completed: false },
    });
  }),
  /*O endpoint getLesInProg utiliza a função findMany do Prisma para verificar as lições em progresso. É um processo protegido, afeta apenas o usuário logado. */
  getLesInProg: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userLessonProgress.findMany({
      where: { userId: ctx.session.user.id, completed: false },
    });
  }),
  /*O endpoint getTaskInProg utiliza a função findMany do Prisma para verificar as tarefas em progresso. É um processo protegido, afeta apenas o usuário logado. */
  getTaskInProg: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userTaskProgress.findMany({
      where: {
        userId: ctx.session.user.id,
        NOT: { status: TaskStatus.Completed },
      },
    });
  }),
  /*O endpoint getTasks4Less recebe como parâmetro uma string que é validada pela biblioteca 'zod' e utiliza a função findMany do Prisma para verificar todas as tarefas referente a uma lição específica. É um processo protegido, afeta apenas o usuário logado. */
  getTasks4Less: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      return ctx.prisma.userTaskProgress.findMany({
        where: { lessonId: input, userId: ctx.session.user.id },
      });
    }),
  /*O endpoint updModLastSeen recebe como parâmetro uma string, a qual é validada pela biblioteca 'zod'. A função 'mutation' é responsável por atualizar o último módulo visitado por meio do método 'update' do Prisma refente a um ID específico. 
  É um processo protegido, afeta apenas o usuário logado. */
  updModLastSeen: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.userModuleProgress.update({
        where: {
          userId_moduleId: { userId: ctx.session.user.id, moduleId: input },
        },
        data: { lastTimeSeen: new Date() },
      });
    }),
  /*O endpoint updLessLastSeen recebe como uma parâmetro uma string, a qual é validada pela biblioteca 'zod'. A função 'mutation' é responsável por atualizar a última lição visitada por meio do método 'update' do Prisma refente a um ID específico.
  É um processo protegido, afeta apenas o usuário logado. */
  updLessLastSeen: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.userLessonProgress.update({
        where: {
          userId_lessonId: { userId: ctx.session.user.id, lessonId: input },
        },
        data: { lastTimeSeen: new Date() },
      });
    }),
  
  /*O endpoint createLessSugg recebe como parâmetro um formulário referente a sugestão de uma tarefa e utiliza a função 'mutation' para criar essa sugestão por meio do método 'create' do Prisma.
  É um processo protegido, afeta apenas o usuário logado. */
  createLessSugg: protectedProcedure
    .input(LessSuggestionSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.lesSuggestion.create({
        data: {
          lessonId: input.lessonId,
          userId: ctx.session.user.id,
          text: input.text,
        },
      });
    }),
  /*O endpoint submitTask recebe como um parâmeto um objeto, o qual possui um ID específico e um campo de texto, e é validado pela biblioteca 'zod'. A função 'mutation' utiliza essa informação para atualizar a resposta da tarefa e mudar a condição dela para 'submetida', utilizando o método 'update' do Prisma.
  É um processo protegido, afeta apenas o usuário logado. */
  submitTask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        richText: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.userTaskProgress.update({
        where: {
          userId_taskId: { taskId: input.id, userId: ctx.session.user.id },
        },
        data: {
          richText: input.richText,
          status: TaskStatus.Submitted,
        },
      });
    }),
  /*O endpoint compLesson recebe como parâmetro uma string, a qual é validada pela biblioteca 'zod'. A função 'mutation' , em um processo assíncrono, espera receber o progresso da lição, por meio do método findUnique do Prisma. 
  Assim, é verificado se o progresso do usuário naquela lição está completo, mudando o estado da lição para 'completa' caso esteja 'imcompleta'. No caso em que o estado da lição já está 'completa', nada é realizado.
  É um processo protegido, afeta apenas o usuário logado. */
  compLesson: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userProg = await ctx.prisma.userLessonProgress.findUnique({
        where: {
          userId_lessonId: { userId: ctx.session.user.id, lessonId: input },
        },
      });

      if (!userProg?.completed) {
        return ctx.prisma.userLessonProgress.update({
          where: {
            userId_lessonId: { userId: ctx.session.user.id, lessonId: input },
          },
          data: { completed: true, completedAt: new Date() },
        });
      }
    }),
  /*O endpoint finishModule recebe como parâmetro uma string, a qual é validada pela biblioteca 'zod'. A função 'mutation' , em um processo assíncrono, espera receber o progresso do módulo, por meio do método findUnique do Prisma. 
  Assim, é verificado se o progresso do usuário naquele módulo está completo, mudando o estado do móudulo para 'completo' caso esteja 'imcompleto'. No caso em que o estado do módulo já está 'completo', nada é realizado.
  É um processo protegido, afeta apenas o usuário logado. */
  finishModule: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userProg = await ctx.prisma.userModuleProgress.findUnique({
        where: {
          userId_moduleId: { userId: ctx.session.user.id, moduleId: input },
        },
      });

      if (!userProg?.completed) {
        return ctx.prisma.userModuleProgress.update({
          where: {
            userId_moduleId: { userId: ctx.session.user.id, moduleId: input },
          },
          data: { completed: true, completedAt: new Date() },
        });
      }
      return null;
    }),
});
