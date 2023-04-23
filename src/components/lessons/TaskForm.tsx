/* eslint-disable react-hooks/exhaustive-deps */
import {
  Modal,
  Button,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  FormLabel,
  Input,
  FormErrorMessage,
  FormControl,
  Textarea,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type RouterTypes, trpc } from "@utils/trpc";
import { type Task } from "@prisma/client";
import useCustomToast from "@hooks/useCustomToast";

export const TasksFormSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  name: z.string().min(1, { message: "O nome da atividade é obrigatório" }),
  richText: z
    .string()
    .min(1, { message: "O conteúdo da atividade é necessário" }),
});

export type TaskFormType = z.infer<typeof TasksFormSchema>;

interface EditAddTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: RouterTypes["lesson"]["getLessTasks"]["output"][0] | null;
  lessonId: string;
  setFormData: React.Dispatch<React.SetStateAction<Task | null | undefined>>;
}

const TaskForm = ({
  isOpen,
  onClose,
  initialValues,
  lessonId,
  setFormData,
}: EditAddTaskFormProps) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<TaskFormType>({
    resolver: zodResolver(TasksFormSchema),
    defaultValues: { id: "", lessonId },
    mode: "onBlur",
  });

  const { showErrorToast, showSuccessToast } = useCustomToast();

  useEffect(() => {
    if (initialValues) {
      const tempData: TaskFormType = {
        id: initialValues.id,
        name: initialValues.name,
        richText: initialValues.richText,
        lessonId: lessonId,
      };
      reset(tempData);
    }
  }, [initialValues]);

  const utils = trpc.useContext();
  const createTask = trpc.task.createTask.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não foi possível criar a atividade");
    },
    onSuccess() {
      showSuccessToast("A atividade foi criada com sucesso");
      utils.lesson.getLessTasks.refetch({ lessonId });
    },
  });
  const updateTask = trpc.task.updateTask.useMutation({
    async onMutate(data) {
      await utils.lesson.getLessTasks.cancel({ lessonId });
      const prevData = utils.lesson.getLessTasks.getData({
        lessonId,
      }) as Task[];
      const filteredData = prevData.filter((task) => task.id !== data.id);
      const dummyData: Task = { ...data, createdAt: new Date() };
      utils.lesson.getLessTasks.setData([...filteredData, dummyData], {
        lessonId,
      });
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.lesson.getLessTasks.setData(ctx?.prevData, { lessonId });
      showErrorToast(err.message, "Não foi possível atualizar a atividade");
    },
    onSuccess() {
      showSuccessToast("A atividade foi atualizada com sucesso");
    },
  });

  const onSubmit = (data: TaskFormType) => {
    initialValues ? updateTask.mutate(data) : createTask.mutate(data);
    setFormData(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {initialValues
            ? `Editando Atividade ${initialValues.name}`
            : "Criando atividade"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            id="form"
          >
            <FormControl id="name" isRequired isInvalid={!!errors.name}>
              <FormLabel>Nome da atividade</FormLabel>
              <Input placeholder="nome" {...register("name")} bgColor="white" />
              {errors.name && (
                <FormErrorMessage>{errors.name.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl id="richText" isRequired isInvalid={!!errors.richText}>
              <FormLabel>Conteúdo da Atividade em Markdown</FormLabel>
              <Textarea
                placeholder="nome"
                {...register("richText")}
                bgColor="white"
              />
              {errors.richText && (
                <FormErrorMessage>{errors.richText.message}</FormErrorMessage>
              )}
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose}>
            Fechar
          </Button>
          <Button
            colorScheme="red"
            type="submit"
            form="form"
            onClick={() => {
              onClose();
            }}
          >
            {initialValues ? "Atualizar" : "Criar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TaskForm;
