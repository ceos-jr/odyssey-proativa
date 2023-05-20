/*Importações: TasksFormSchema é o formulário responsável pela entrega das Tasks. TaskStatus é o dado utilizado para verificar o estado da Task. TRPCError é o tratamento de erro do tRPC que será utilizado nos endpoints. 'z' é uma biblioteca para validação de dados que valida os parâmetros dos endpoints.*/
import { TasksFormSchema } from "@components/lessons/TaskForm";
import { TaskStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

/*Importações: Funções e tipos definidos pelo tRPC que vão ser utilizados nos endpoints. */
import {
  router,
  adminProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";

type TotalAndUnfCountByUser = {
  total: bigint;
  finished: bigint;
};

/*O endpoint taskRouter é utilizado somente pelo admin para criar novas tasks. Dentro do método 'mutation', que é assíncrono, ele espera o banco de dados criar a task usando o método 'create' do Prisma.*/
export const taskRouter = router({
  createTask: adminProcedure
    .input(TasksFormSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.create({
        data: {
          lessonId: input.lessonId,
          name: input.name,
          richText: input.richText,
        },
      });

      /*Dentro da rota Task, 'users' pega todos os usuários referente à uma lição específica utilizando o método 'findMany' do Prisma. */
      const users = await ctx.prisma.userLessonProgress.findMany({
        where: { lessonId: input.lessonId },
        select: { userId: true },
      });

      /*O retorno do método 'mutation' mapeia todos os usuários encontrados em 'users' cria a task baseada no seu progresso, utilizando o método 'createMany' do Prisma.*/
      return ctx.prisma.userTaskProgress.createMany({
        data: users.map((user) => ({
          lessonId: input.lessonId,
          taskId: task.id,
          userId: user.userId,
        })),
      });
    }),

  /*O método updateTask é utilizado somente pelo o admin para atualizar uma Task. Para isso, é utilizado o método 'update' do Prisma.*/
  updateTask: adminProcedure
    .input(TasksFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          name: input.name,
          richText: input.richText,
        },
      });
    }),

  /*O método deleteTask é utilizado somente pelo admin para deletar uma task. Ele faz a validação dos dados pela biblioteca 'zod' e então deleta a Task com o ID específico.*/
  deleteTask: adminProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.task.delete({ where: { id: input } });
  }),

  /*O método lastTasksByUser é responsável por retornar a última Task realizada pelo usuário. Caso o usuário não seja o Admin, o trpc jogará um erro.*/
  lastTasksByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      return ctx.prisma.userTaskProgress.findMany({
        where: { userId },
        include: { task: { select: { name: true } } },
        orderBy: { completedAt: "desc" },
        take: 5,
      });
    }),

  /*O método totalAndUnfCountByUser retorna o total de tasks e o total de tasks não finalizadas por usuário. Caso o usuário não seja o Admin, o trpc jogará um erro. */
  totalAndUnfCountByUser: protectedProcedure
    .input(z.string().optional())
    .query(async ({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      const data = await ctx.prisma.$queryRaw<TotalAndUnfCountByUser[]>`
        SELECT 
          COUNT(*) AS total, 
          COUNT(CASE WHEN status::text = ${TaskStatus.COMPLETED}::text THEN 1 ELSE NULL END) AS finished
        FROM "UserTaskProgress"
        WHERE "userId" = ${userId}
      `;
      return {
        total: Number(data[0]?.total),
        finished: Number(data[0]?.finished),
      };
    }),

  /*O método getTasksByUser coleta as tarefas do usuário. melhorar a documentação.*/
  getTasksByUser: protectedProcedure
    .input(z.string())
    .query(({ ctx, input }) => {
      const userId = input;
      return ctx.prisma.userTaskProgress.findMany({
        where: { userId },
        include: { task: true },
        orderBy: { completedAt: "desc" },
      });
    }),

  /*O método totalTasksByUser retorna o total de tasks por usuário, utilizando o método count do Prisma. Caso o usuário não seja um Admin, o trpc jogará um erro.*/
  totalTasksByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;
      return ctx.prisma.userTaskProgress.count({
        where: { userId },
      });
    }),

  /*O método finTasksByUser retorna o total de tasks finalizadas. O método 'count' do Prisma adiciona as tasks com o status 'COMPLETO'. Caso o usuário não seja o Admin, o trpc jogará um erro.*/
  finTasksByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;
      return ctx.prisma.userTaskProgress.count({
        where: { userId, status: TaskStatus.COMPLETED },
      });
    }),
});
