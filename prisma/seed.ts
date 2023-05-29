import { PrismaClient, type Prisma } from "@prisma/client";
import { mockUsers as mU } from "../src/utils/mock-user";
import createMockedLessonProgress from "./seeds/lessonsProgSeed";
import createMockedLessons from "./seeds/lessonsSeed";
import createMockedLesSuggestion from "./seeds/lesSuggSeed";
import createMockedTaskProgress from "./seeds/tasksProgSeed";
import createMockedTasks from "./seeds/tasksSeed";
const prisma = new PrismaClient();

const modules: Prisma.ModuleCreateInput[] = [
  {
    id: "cla8sob6p000008l0dzndfppl",
    name: "css",
    body: "Jonathan galindo's body",
    description: "Seja bem vindos ao módulo CSS",
  },
];

const modSugg = [
  {
    userId: mU.MEMBER.id as string,
    moduleId: modules[0]?.id as string,
    text: "I expect this on this module",
  },
  {
    userId: mU.MEMBER.id as string,
    moduleId: modules[0]?.id as string,
    text: "This was already readed",
    readed: true,
  },
];

async function main() {
  console.log("wiping everything");
  await prisma.module.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.userLessonProgress.deleteMany({});
  await prisma.userTaskProgress.deleteMany({});
  await prisma.modSuggestion.deleteMany({});
  await prisma.lesSuggestion.deleteMany({});

  console.log(`Start seeding ...`);
  console.log("creating users");
  await prisma.user.upsert({
    create: {
      id: mU.ADMIN.id,
      name: mU.ADMIN.name,
      email: mU.ADMIN.email,
      role: "ADMIN",
    },
    update: {},
    where: { email: mU.ADMIN.email },
  });
  await prisma.user.upsert({
    create: {
      id: mU.MEMBER.id,
      name: mU.MEMBER.name,
      email: mU.MEMBER.email,
      role: "MEMBER",
    },
    update: {},
    where: { email: mU.MEMBER.email },
  });
  await prisma.user.upsert({
    create: {
      id: mU.GUEST.id,
      name: mU.GUEST.name,
      email: mU.GUEST.email,
      role: "GUEST",
    },
    update: {},
    where: { email: mU.GUEST.email },
  });
  console.log("creating modules");
  await prisma.module.createMany({ data: modules });
  console.log("creating lessons");
  await createMockedLessons(prisma, modules[0]?.id as string);
  console.log("creating tasks");
  await createMockedTasks(prisma, modules[0]?.id as string);
  console.log("creating lessonsProgress");
  await createMockedLessonProgress(
    prisma,
    modules[0]?.id as string,
    mU.MEMBER.id
  );
  console.log("creating tasksProgress");
  await createMockedTaskProgress(
    prisma,
    modules[0]?.id as string,
    mU.MEMBER.id
  );
  console.log("creating modules suggestions");
  await prisma.modSuggestion.createMany({ data: modSugg });
  console.log("creating lessons suggestions");
  await createMockedLesSuggestion(
    prisma,
    modules[0]?.id as string,
    mU.MEMBER.id
  );

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
