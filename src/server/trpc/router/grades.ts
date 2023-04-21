import { TaskStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { router, adminProcedure, protectedProcedure } from "../trpc";
import { type GradeFrequency } from "./admin";

export type CumulativeAvg = {
  date_alias: string;
  cumulative_avg: number;
};

export const gradesRouter = router({
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
