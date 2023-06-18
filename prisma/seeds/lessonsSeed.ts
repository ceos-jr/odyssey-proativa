import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import moment from "moment";

const createMockedLessons = async (prisma: PrismaClient, moduleId: string) => {
  const lessons: Prisma.LessonCreateManyInput[] = [];

  let previousLessonId = null;
  const goodDateToWork = moment().subtract(10, "months").toDate();

  for (let i = 0; i < 5; i++) {
    const lesson: Prisma.LessonUncheckedCreateInput = {
      id: faker.string.uuid(),
      index: i + 1,
      name: faker.lorem.words(2),
      createdAt: goodDateToWork,
      updatedAt: goodDateToWork,
      richText: faker.lorem.paragraphs(3),
      moduleId: moduleId,
      previous: previousLessonId,
      next: null,
    };

    lessons.push(lesson);
    previousLessonId = lesson.id;
  }

  for (let i = 0; i < 4; i++) {
    if (lessons[i] && lessons[i + 1]) {
      //@ts-ignore
      lessons[i].next = lessons[i + 1].id;
    }
  }
  const createdLessons = await prisma.lesson.createMany({
    data: lessons,
    skipDuplicates: true,
  });

  console.log(
    `${createdLessons.count} tasks created or upserted successfully.`
  );

  return lessons[createdLessons.count - 1]?.id;
};
export default createMockedLessons;
