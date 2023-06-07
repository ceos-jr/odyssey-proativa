import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import moment from "moment";
import { TaskStatus } from "../../src/utils/constants";

const createMockedTaskProgress = async (
  prisma: PrismaClient,
  moduleId: string,
  userId: string
) => {
  let tasksProgress: Prisma.UserTaskProgressCreateManyInput[] = [];
  let previoussubmittedAt = moment();

  const lessons = await prisma.lesson.findMany({
    where: { moduleId: moduleId },
    include: { tasks: true },
  });

  let counter = 0;

  lessons.forEach((les) =>
    les.tasks.forEach((task) => {
      const completedOrSubmitted: {
        grade?: number,
        status: TaskStatus | undefined
      } = counter%3 == 2 ? {
        grade: faker.number.int({ min: 0, max: 5 }),
        status: TaskStatus.Completed
      } : {
        grade: undefined,
        status: TaskStatus.Submitted
      };

      const taskProg: Prisma.UserTaskProgressUncheckedCreateInput = {
        userId: userId,
        grade: completedOrSubmitted.grade,
        richText: faker.lorem.paragraphs(1),
        startedAt: previoussubmittedAt.toDate(),
        submittedAt: previoussubmittedAt.add(1, "day").toDate(),
        lessonId: les.id,
        taskId: task.id,
        status: completedOrSubmitted.status,
      };
      tasksProgress.push(taskProg);

      let time: number;

      if (counter < 10) time = 3;
      else if (counter < 20) time = Math.log2(counter * 6);
      else time = Math.log2(counter * 12);

      previoussubmittedAt = previoussubmittedAt.subtract(time, "days");
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
