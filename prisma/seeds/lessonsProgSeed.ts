import { Prisma, PrismaClient } from "@prisma/client";
import moment from "moment";

const createMockedLessonProgress = async (
  prisma: PrismaClient,
  moduleId: string,
  userId: string
) => {
  let lessonsProgress: Prisma.UserLessonProgressCreateManyInput[] = [];
  let goodTimeToWork = moment().subtract(9, "months");

  await prisma.userModuleProgress.create({
    data: {
      userId: userId,
      moduleId: moduleId,
      startedAt: goodTimeToWork.toDate(),
    },
  });

  const lessons = await prisma.lesson.findMany({
    where: { moduleId: moduleId },
  });

  lessons.forEach(async (les, i) => {
    const taskProg: Prisma.UserLessonProgressUncheckedCreateInput = {
      userId: userId,
      moduleId: moduleId,
      startedAt: goodTimeToWork.toDate(),
      lessonId: les.id,
      completed: i < 3 ? true : false,
      completedAt: i < 3 ? goodTimeToWork.add(6, "days").toDate() : null,
    };
    lessonsProgress.push(taskProg);
  });

  const createdTasksProgress = await prisma.userLessonProgress.createMany({
    data: lessonsProgress,
    skipDuplicates: true,
  });

  console.log(
    `${createdTasksProgress.count} lessons progress created or upserted successfully.`
  );
};

export default createMockedLessonProgress;
