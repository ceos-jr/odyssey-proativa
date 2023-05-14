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
// {number} media - A média cumulativa da turma naquele dia.

export type CumulativeAvg = {
  date_alias: string;
  media: number;
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
// {Function} floatLongTermAvg - retorna a média de todas as notas no formato float.
// {Function} integer1MonthAvg - retorna as médias do mês anterior separadas em intervalos de 2 dias.
// {Function} integer3MonthAvg - retorna as médias dos 3 meses anteriores separadas em intervalos de 6 dias.
// {Function} integer6MonthAvg - retorna as médias dos 3 meses anteriores separadas em intervalos de 12 dias.
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
  //Disponível para usuário autenticado
  floatLongTermAvg: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
    SELECT ROUND(AVG(grade)::numeric, 2) AS media
    FROM "UserTaskProgress";`;
  }),

  integer1MonthAvg: adminProcedure.query(({ ctx }) => {
    /* 
        O intervalo "BETWEEN NOW() - INTERVAL '33 DAY' AND NOW() - INTERVAL '1 DAY'" é assim 
      para que o gráfico não passe do momento atual, pois ele tem amplitude de 2 dias, ou seja,
      caso eum intervalo comece no último dia ele poderá conter até 1 dia futuro.
    */

    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      WITH intervals AS (
        SELECT 
          date_trunc('day', "completedAt" - INTERVAL '1 day') + INTERVAL '2 day' AS interval_start,
          SUM(grade) as sum_grade,
          COUNT(grade) as count_grade
        FROM "UserTaskProgress"
        WHERE
          status::text = ${TaskStatus.COMPLETED}::text
          AND "completedAt" BETWEEN NOW() - INTERVAL '33 DAY' AND NOW() - INTERVAL '1 DAY'
        GROUP BY 
          interval_start
        ORDER BY interval_start ASC
      )
      SELECT
        to_char(interval_start, 'DD/MM') AS date_alias,
        ROUND(CAST(SUM(sum_grade) OVER (ORDER BY interval_start ASC) / SUM(count_grade) OVER (ORDER BY interval_start ASC) AS numeric), 2) as media
      FROM
        intervals;
    `;
  }),

  integer3MonthAvg: adminProcedure.query(({ ctx }) => {
    /* 
        O intervalo "BETWEEN NOW() - INTERVAL '97 DAY' AND NOW() - INTERVAL '5 DAY'" é assim 
      para que o gráfico não passe do momento atual, pois ele tem amplitude de 6 dias, ou seja,
      caso eum intervalo comece no último dia ele poderá conter até 5 dias futuros.
    */

    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      WITH intervals AS (
        SELECT 
          date_trunc('day', "completedAt" - INTERVAL '1 day') + INTERVAL '6 day' AS interval_start,
          SUM(grade) as sum_grade,
          COUNT(grade) as count_grade
        FROM "UserTaskProgress"
        WHERE
        status::text = ${TaskStatus.COMPLETED}::text
          AND "completedAt" BETWEEN NOW() - INTERVAL '97 DAY' AND NOW() - INTERVAL '5 DAY'
        GROUP BY interval_start
        ORDER BY interval_start ASC
      )
      SELECT
        to_char(interval_start, 'DD/MM') AS date_alias,
        ROUND(CAST(SUM(sum_grade) OVER (ORDER BY interval_start ASC) / SUM(count_grade) OVER (ORDER BY interval_start ASC) AS numeric), 2) as media
      FROM
        intervals;
    `;
  }),

  integer6MonthAvg: adminProcedure.query(({ ctx }) => {
    /* 
        O intervalo "BETWEEN NOW() - INTERVAL '192 DAY' AND NOW() - INTERVAL '11 DAY'" é assim 
      para que o gráfico não passe do momento atual, pois ele tem amplitude de 12 dias, ou seja,
      caso eum intervalo comece no último dia ele poderá conter até 11 dias futuros.
    */
    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
    WITH intervals AS (
      SELECT 
        date_trunc('day', "completedAt" - INTERVAL '1 day') + INTERVAL '12 day' AS interval_start,
        SUM(grade) as sum_grade,
        COUNT(grade) as count_grade
      FROM "UserTaskProgress"
      WHERE
      status::text = ${TaskStatus.COMPLETED}::text
        AND "completedAt" BETWEEN NOW() - INTERVAL '192 DAY' AND NOW() - INTERVAL '11 DAY'
      GROUP BY interval_start
      ORDER BY interval_start ASC
    )
    SELECT
      to_char(interval_start, 'DD/MM') AS date_alias,
      ROUND(CAST(SUM(sum_grade) OVER (ORDER BY interval_start ASC) / SUM(count_grade) OVER (ORDER BY interval_start ASC) AS numeric), 2) as media
    FROM
      intervals;
  `;
  }),

  avg30Days: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
    WITH intervals AS (
      SELECT
        date_trunc('day', "completedAt" - INTERVAL '1 day') + INTERVAL '2 day' AS interval_start,
        SUM(grade) as sum_grade,
        COUNT(grade) as count_grade
      FROM
        "UserTaskProgress"
      WHERE
        status::text = ${TaskStatus.COMPLETED}::text
        AND "completedAt" BETWEEN NOW() - INTERVAL '30 DAY' AND NOW()
      GROUP BY
        interval_start
      ORDER BY
        interval_start DESC
      LIMIT 15
    )
    SELECT
      to_char(interval_start, 'DD/MM') AS date_alias,
      ROUND(CAST(SUM(sum_grade) OVER (ORDER BY interval_start ASC) / SUM(count_grade) OVER (ORDER BY interval_start ASC) AS numeric), 2) as media
    FROM
      intervals;
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
      WITH intervals AS (
        SELECT
          date_trunc('day', "completedAt" - INTERVAL '1 day') + INTERVAL '2 day' AS interval_start,
          SUM(grade) as sum_grade,
          COUNT(grade) as count_grade
        FROM
          "UserTaskProgress"
        WHERE
          "userId" = ${userId}
          AND status::text = ${TaskStatus.COMPLETED}::text
          AND "completedAt" BETWEEN NOW() - INTERVAL '30 DAY' AND NOW()
        GROUP BY
          interval_start
        ORDER BY
          interval_start ASC
        LIMIT 15
      )
      SELECT
        to_char(interval_start, 'DD/MM') AS date_alias,
        ROUND(CAST(SUM(sum_grade) OVER (ORDER BY interval_start ASC) / SUM(count_grade) OVER (ORDER BY interval_start ASC) AS numeric), 2) as media
      FROM
        intervals;
`;
    }),
  avg3Months: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      WITH intervals AS (
        SELECT
          date_trunc('day', "completedAt" - INTERVAL '1 day') + INTERVAL '6 days' AS interval_start,
          SUM(grade) as sum_grade,
          COUNT(grade) as count_grade
        FROM
          "UserTaskProgress"
        WHERE
          status::text = ${TaskStatus.COMPLETED}::text
          AND "completedAt" BETWEEN NOW() - INTERVAL '3 MONTH' AND NOW()
        GROUP BY
          interval_start
        ORDER BY
          interval_start DESC
        LIMIT 45
      )
      SELECT
        to_char(interval_start, 'DD/MM') AS date_alias,
        ROUND(CAST(SUM(sum_grade) OVER (ORDER BY interval_start ASC) / SUM(count_grade) OVER (ORDER BY interval_start ASC) AS numeric), 2) as media
      FROM
        intervals;
      `;
  }),
  avg3MonthsByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      WITH intervals AS (
        SELECT
          date_trunc('day', "completedAt" - INTERVAL '1 day') + INTERVAL '6 days' AS interval_start,
          SUM(grade) as sum_grade,
          COUNT(grade) as count_grade
        FROM
          "UserTaskProgress"
        WHERE
          "userId" = ${userId}
          AND status::text = ${TaskStatus.COMPLETED}::text
          AND "completedAt" BETWEEN NOW() - INTERVAL '3 MONTH' AND NOW()
        GROUP BY
          interval_start
        ORDER BY
          interval_start ASC
        LIMIT 15
      )
      SELECT
        to_char(interval_start, 'DD/MM') AS date_alias,
        ROUND(CAST(SUM(sum_grade) OVER (ORDER BY interval_start ASC) / SUM(count_grade) OVER (ORDER BY interval_start ASC) AS numeric), 2) as media
      FROM
        intervals;
      `;
    }),
  avg6Months: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      WITH intervals AS (
        SELECT
          date_trunc('day', "completedAt" - INTERVAL '1 day') + INTERVAL '12 days' AS interval_start,
          SUM(grade) as sum_grade,
          COUNT(grade) as count_grade
        FROM
          "UserTaskProgress"
        WHERE
          status::text = ${TaskStatus.COMPLETED}::text
          AND "completedAt" BETWEEN NOW() - INTERVAL '6 MONTH ' AND NOW()
        GROUP BY
          interval_start
        ORDER BY
          interval_start DESC
        LIMIT 90
      )
      SELECT
        to_char(interval_start, 'DD/MM') AS date_alias,
        ROUND(CAST(SUM(sum_grade) OVER (ORDER BY interval_start ASC) / SUM(count_grade) OVER (ORDER BY interval_start ASC) AS numeric), 2) as media
      FROM
        intervals;
      `;
  }),
  avg6MonthsByUser: protectedProcedure
    .input(z.string().optional())
    .query(({ ctx, input }) => {
      if (input && ctx.session.user.role !== "ADMIN")
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const userId = input ? input : ctx.session.user.id;

      return ctx.prisma.$queryRaw<CumulativeAvg[]>`
      WITH intervals AS (
        SELECT
          date_trunc('day', "completedAt" - INTERVAL '1 day') + INTERVAL '12 days' AS interval_start,
          SUM(grade) as sum_grade,
          COUNT(grade) as count_grade
        FROM
          "UserTaskProgress"
        WHERE
          "userId" = ${userId}
          AND status::text = ${TaskStatus.COMPLETED}::text
          AND "completedAt" BETWEEN NOW() - INTERVAL '6 MONTH' AND NOW()
        GROUP BY
          interval_start
        ORDER BY
          interval_start ASC
        LIMIT 15
      )
      SELECT
        to_char(interval_start, 'DD/MM') AS date_alias,
        ROUND(CAST(SUM(sum_grade) OVER (ORDER BY interval_start ASC) / SUM(count_grade) OVER (ORDER BY interval_start ASC) AS numeric), 2) as media
      FROM
        intervals;
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
