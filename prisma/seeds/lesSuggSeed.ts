import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import moment from "moment";

const createMockedLesSuggestion = async (
  prisma: PrismaClient,
  moduleId: string,
  userId: string
) => {
  const suggestions: Prisma.LesSuggestionCreateManyInput[] = [];
  const lessons = await prisma.lesson.findMany({
    where: { moduleId: moduleId },
    take: 2,
  });

  lessons.forEach((les) => {
    const sug: Prisma.LesSuggestionUncheckedCreateInput = {
      id: faker.string.uuid(),
      userId: userId,
      lessonId: les.id,
      createdAt: moment().subtract(10, "months").toDate(),
      text: faker.lorem.paragraphs(2),
    };
    suggestions.push(sug);
  });

  const createdSuggestions = await prisma.lesSuggestion.createMany({
    data: suggestions,
    skipDuplicates: true,
  });

  console.log(
    `${createdSuggestions.count} lesson suggestions created or upserted successfully.`
  );
};

export default createMockedLesSuggestion;
