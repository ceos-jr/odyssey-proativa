import { PrismaClient, type Prisma } from "@prisma/client";
import { mockUsers as mU } from "../src/utils/mock-user";
const prisma = new PrismaClient();

const modules: Prisma.ModuleCreateInput[] = [
  {
    id: "cla8sob6p000008l0dzndfppl",
    name: "css",
    description: "Seja bem vindos ao módulo CSS",
  },
];

const lessons: Prisma.LessonCreateManyInput[] = [
  {
    id: "cla8ssx1p000308l028yn0hnn",
    index: 1,
    name: "Seletores, Especificidade, Cascata e Herança",
    moduleId: modules[0]?.id as string,
    richText: "",
  },
  {
    name: "Posicionamento CSS",
    index: 2,
    moduleId: modules[0]?.id as string,
    richText: "",
  },
  {
    name: "Flexbox Layout",
    index: 3,
    moduleId: modules[0]?.id as string,
    richText: "",
  },
  {
    name: "Grid Layout",
    index: 4,
    moduleId: modules[0]?.id as string,
    richText: "",
  },
];

const tasks: Prisma.TaskCreateManyInput[] = [
  {
    name: "plantar bananeira",
    richText:
      "tente se jogar no chao com as duas maos pra baixo, boa sorte kkk",
    lessonId: lessons[0]?.id as string,
  },
  {
    name: "va pro UFC derrotar o Poatan",
    richText: "esse aqui que vc precisa de sorte",
    lessonId: lessons[0]?.id as string,
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

const lesSuggestions = [
  {
    userId: mU.MEMBER.id as string,
    lessonId: lessons[0]?.id as string,
    text: "I expect this on this module",
  },
  {
    userId: mU.MEMBER.id as string,
    lessonId: lessons[0]?.id as string,
    text: "This was already readed",
    readed: true,
  },
];

async function main() {
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
  await prisma.lesson.createMany({ data: lessons });
  console.log("creating tasks");
  await prisma.task.createMany({ data: tasks });
  console.log("creating modules suggestions");
  await prisma.modSuggestion.createMany({ data: modSugg });
  console.log("creating lessons suggestions");
  await prisma.lesSuggestion.createMany({ data: lesSuggestions });

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
