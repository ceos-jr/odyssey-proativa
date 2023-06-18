import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import moment from "moment";

const createMockedModules = async (prisma: PrismaClient) => {
  const modules: Prisma.ModuleCreateManyInput[] = [];

  const goodDateToWork = moment().subtract(10, "months").toDate();

  for (let i = 0; i < 5; i++) {
    const lesson: Prisma.ModuleCreateInput = {
      id: faker.string.uuid(),
      name: faker.lorem.words(3),
      updatedAt: goodDateToWork,
      description: faker.lorem.paragraphs(1),
    };

    modules.push(lesson);
  }

  const createdModules = await prisma.module.createMany({
    data: modules,
    skipDuplicates: true,
  });

  console.log(
    `${createdModules.count} modules created or upserted successfully.`
  );

  return modules[createdModules.count - 1]?.id;
};
export default createMockedModules;
