import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import moment from "moment";

const createMockedTasks = async (prisma: PrismaClient, moduleId: string) => {
  let tasks: Prisma.TaskCreateManyInput[] = [];

  let goodDateToWork = moment().subtract(10, "months").toDate();

  const lessons = await prisma.lesson.findMany({
    where: { moduleId: moduleId, index: { lt: 4 } },
  });

  lessons.forEach((les) => {
    for (let i = 0; i < 10; i++) {
      const task: Prisma.TaskUncheckedCreateInput = {
        id: faker.string.uuid(),
        name: faker.lorem.words(2),
        richText: faker.lorem.paragraphs(2),
        createdAt: goodDateToWork,
        lessonId: les.id,
      };

      tasks.push(task);
    }
  });

  const createdTasks = await prisma.task.createMany({
    data: tasks,
    skipDuplicates: true,
  });

  console.log(`${createdTasks.count} tasks created or upserted successfully.`);
};

export default createMockedTasks;
