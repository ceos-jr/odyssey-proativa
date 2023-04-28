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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { trpc } from "@utils/trpc";
import useCustomToast from "@hooks/useCustomToast";
import { TasksFormSchema } from "@utils/schemas";

export type TaskFormType = z.infer<typeof TasksFormSchema>;

interface CreateTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
}

const CreateTaskForm = ({
  isOpen,
  onClose,
  lessonId,
}: CreateTaskFormProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<TaskFormType>({
    resolver: zodResolver(TasksFormSchema),
    defaultValues: { id: "", lessonId },
    mode: "onBlur",
  });

  const { showErrorToast, showSuccessToast } = useCustomToast();

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

  const onSubmit = (data: TaskFormType) => {
    createTask.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Criar Atividade
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
            colorScheme="whatsapp"
            type="submit"
            form="form"
            onClick={() => {
              onClose();
            }}
          >
            Criar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateTaskForm;
