import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import moment from "moment";

const createMockedTaskProgress = async (
  prisma: PrismaClient,
  moduleId: string,
  userId: string
) => {
  let tasksProgress: Prisma.UserTaskProgressCreateManyInput[] = [];
  let previousCompletedAt = moment();

  const lessons = await prisma.lesson.findMany({
    where: { moduleId: moduleId },
    include: { tasks: true },
  });

  let counter = 0;

  lessons.forEach((les) =>
    les.tasks.forEach((task) => {
      const taskProg: Prisma.UserTaskProgressUncheckedCreateInput = {
        userId: userId,
        grade: faker.number.int({ min: 0, max: 5 }),
        richText: faker.lorem.paragraphs(1),
        startedAt: previousCompletedAt.toDate(),
        completedAt: previousCompletedAt.add(1, "day").toDate(),
        lessonId: les.id,
        taskId: task.id,
        status: "COMPLETED",
      };
      tasksProgress.push(taskProg);

      let time: number;

      if (counter < 10) time = 3;
      else if (counter < 20) time = Math.log2(counter * 6);
      else time = Math.log2(counter * 12);

      previousCompletedAt = previousCompletedAt.subtract(time, "days");
      counter++;
    })
  );

  const createdTasksProgress = await prisma.userTaskProgress.createMany({
    data: tasksProgress,
    skipDuplicates: true,
  });

  console.log(
    `${createdTasksProgress.count} tasks progress created or upserted successfully.`
  );
};

export default createMockedTaskProgress;
