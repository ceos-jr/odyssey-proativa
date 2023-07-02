import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { mockUsers as mU } from "../../src/utils/mock-user";

const createMockedComments = async (prisma: PrismaClient) => {
  let lessons = await prisma.lesson.findMany({
    take: 5,
  });

  let adminId = mU.ADMIN.id as string;
  let memberId = mU.MEMBER.id as string;

  for (let index = 0; index < lessons.length; index++) {
    const lesson = lessons[index];
    const fromDate = lesson?.createdAt as Date;

    for (let index = 0; index < 5; index++) {
      await prisma.lessonComment.create({
        data: {
          userId: adminId,
          lessonId: lessons[index]?.id as string,
          text: faker.lorem.paragraph({ min: 1, max: 4 }),
          createdAt: faker.date.between({
            from: fromDate,
            to: new Date(),
          }),
        },
      });

      await prisma.lessonComment.create({
        data: {
          userId: memberId,
          lessonId: lessons[index]?.id as string,
          text: faker.lorem.paragraph({ min: 1, max: 4 }),
          createdAt: faker.date.between({
            from: fromDate,
            to: new Date(),
          }),
        },
      });
    }
  }
};
export default createMockedComments;
