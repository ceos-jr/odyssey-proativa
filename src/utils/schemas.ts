import { z } from "zod";

export const TasksFormSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  name: z.string().min(1, { message: "O nome da atividade é obrigatório" }),
  richText: z
    .string()
    .min(1, { message: "O conteúdo da atividade é necessário" }),
});