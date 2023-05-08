// Importações:
// TaskStatus: enumeração exportada pelo Prisma que representará o status de uma tarefa;
// TRCPError: classe de erro exportada pelo TRPCError;
// z: pacote que define os esquemas de validação dos objetos (garante que estejam no formato esperado pela aplicação)
import { TaskStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, adminProcedure, protectedProcedure } from "../trpc";

// Representa a média cumulativa de uma turma  em um determinado dia
// {Object} CumulativeAvg
// {string} date_alias - O dia representado em formato de string.
// {number} cumulative_avg - A média cumulativa da turma naquele dia.

export type CumulativeAvg = {
  date_alias: string;
  cumulative_avg: number;
};

// Representa a frequência de notas dentro de um intervalo de valores.
// {Object} GradeFrequency
// {number} grade_bin - O intervalo de notas representado pela frequência.
// {number} count - A quantidade de notas dentro desse intervalo.

export type GradeFrequency = {
  grade_bin: number;
  count: number;
};

// Rota para lidar com procedimentos relacionados às notas
// {Object} GradesRouter
// Quatro rotas que retornam a média das notas nos últimos 7 e 30 dias:
// {Function} avg7Days - Retorna um array de médias dos últimos 7 dias das tasks completadas
// {Function} avg7DaysByUser - Retorna um array de médias dos últimos 7 dias das tasks completadas para um usuário específico
// {Function} avg30Days - Retorna um array de médias dos últimos 30 dias das tasks completadas
// {Function} avg30DaysByUser - Retorna um array de médias dos últimos 30 dias das tasks completadas de um usuário específico
// Duas rotas para distribuição de notas:
// {Function} gradeDist - Retorna um array de distribuição de notas de todas as tasks completadas
// {Function} gradeDistByUser - Retorna um array de distribuição de notas das tasks completadas de um usuário específico.

// As notas são obtidas da tabela "UserTaskProgress", que contém o progresso do usuário em tarefas relacionadas ao curso.
// As notas são filtradas pela coluna "status", que contém o estado da tarefa (completa ou incompleta), e pela coluna "completedAt", que contém a data em que a tarefa foi concluída.

export const gradesRouter = router({
  // Disponível apenas para admin
  avg7Days: adminProcedure.input(z.string().optional()).query(({ ctx }) => {
    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      SELECT 
        to_char("completedAt", 'DD/MM') AS date_alias, 
        AVG(grade) OVER (ORDER BY "completedAt" ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as cumulative_avg 
      FROM 
        "UserTaskProgress"
      WHERE 
        status::text = ${TaskStatus.COMPLETED}::text AND
        "completedAt" BETWEEN NOW() - INTERVAL '7 DAY' AND NOW()
      ORDER BY 
        "completedAt" ASC;
    `;
  }),
  //Disponível para usuário autenticado
  avg7DaysByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      SELECT 
        to_char("completedAt", 'DD/MM') AS date_alias, 
        AVG(grade) OVER (ORDER BY "completedAt" ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as cumulative_avg
      FROM 
        "UserTaskProgress"
      WHERE 
        "userId" = ${userId} AND 
        status::text = ${TaskStatus.COMPLETED}::text AND
        "completedAt" BETWEEN NOW() - INTERVAL '7 DAY' AND NOW()
      ORDER BY 
        "completedAt" ASC;
    `;
    }),
  //Disponível para usuário autenticado
  avg30Days: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      SELECT 
        to_char("completedAt", 'DD/MM') AS date_alias, 
        AVG(grade) OVER (ORDER BY "completedAt" ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as cumulative_avg
      FROM 
        "UserTaskProgress"
      WHERE 
        status::text = ${TaskStatus.COMPLETED}::text AND
        "completedAt" BETWEEN NOW() - INTERVAL '30 DAY' AND NOW()
      ORDER BY 
        "completedAt" ASC;
    `;
  }),
  //Disponível para usuário autenticado
  avg30DaysByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      SELECT 
        to_char("completedAt", 'DD/MM') AS date_alias, 
        AVG(grade) OVER (ORDER BY "completedAt" ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as cumulative_avg
      FROM 
        "UserTaskProgress"
      WHERE 
        "userId" = ${userId} AND 
        status::text = ${TaskStatus.COMPLETED}::text AND
        "completedAt" BETWEEN NOW() - INTERVAL '30 DAY' AND NOW()
      ORDER BY 
        "completedAt" ASC;
    `;
    }),
  // A distribuição das notas é calculada usando a função width_bucket do SQL, que agrupa os valores em intervalos de tamanho fixo.

  //Disponível apenas para admin
  gradeDist: adminProcedure.input(z.string().optional()).query(({ ctx }) => {
    return ctx.prisma.$queryRaw<GradeFrequency[]>`
      SELECT
        bins.grade_bin,
        COALESCE(grade_counts.grade_count, 0) AS count
      FROM (
        SELECT generate_series(0, 4) AS grade_bin
      ) AS bins
      LEFT JOIN (
        SELECT
          (width_bucket(grade, 0, 5.001, 5) - 1) * 1 AS grade_bin,
          COUNT(*) AS grade_count
        FROM
          "UserTaskProgress"
        WHERE
          status::text = ${TaskStatus.COMPLETED}::text
        GROUP BY
          grade_bin
      ) AS grade_counts ON bins.grade_bin = grade_counts.grade_bin
      ORDER BY
        bins.grade_bin ASC
    `;
  }),
  //Disponível para usuário autenticado
  gradeDistByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      return ctx.prisma.$queryRaw<GradeFrequency[]>`
      SELECT
        bins.grade_bin,
        COALESCE(grade_counts.grade_count, 0) AS count
      FROM (
        SELECT generate_series(0, 4) AS grade_bin
      ) AS bins
      LEFT JOIN (
        SELECT
          (width_bucket(grade, 0, 5.001, 5) - 1) * 1 AS grade_bin,
          COUNT(*) AS grade_count
        FROM
          "UserTaskProgress"
        WHERE
          "userId" = ${userId} AND
          status::text = ${TaskStatus.COMPLETED}::text
        GROUP BY
          grade_bin
      ) AS grade_counts ON bins.grade_bin = grade_counts.grade_bin
      ORDER BY
        bins.grade_bin ASC
    `;
    }),
});
