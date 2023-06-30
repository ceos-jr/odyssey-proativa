/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import useCustomToast from "@hooks/useCustomToast";
import { trpc } from "@utils/trpc";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const AddCommentSchema = z.object({
  lessonId: z.string(),
  text: z.string().min(1, { message: "O conteúdo da mensagem é necessário" }),
});

export type AddCommentFormType = z.infer<typeof AddCommentSchema>;

interface AddCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
}

const AddCommentModal = ({
  isOpen,
  onClose,
  lessonId,
}: AddCommentModalProps) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<AddCommentFormType>({
    resolver: zodResolver(AddCommentSchema),
    mode: "onBlur",
  });
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const utils = trpc.useContext();

  const CreateComment = trpc.comments.createLessComment.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não foi possivel enviar comentário");
    },
    onSuccess() {
      utils.comments.getByLessonId.refetch(lessonId);
      showSuccessToast("O comentário foi enviado com sucesso");
    },
  });

  const onSubmit = (data: AddCommentFormType) => {
    CreateComment.mutate(data);
    reset({ lessonId, text: "" });
  };

  useEffect(() => {
    if (lessonId) reset({ lessonId, text: "" });
  }, [lessonId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent className="place-self-center self-center">
        <ModalHeader>Faça um comentário</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} id="form">
            <FormControl id="text" isInvalid={!!errors.text}>
              <FormLabel>Mensagem</FormLabel>
              <Textarea className="bg-white" {...register("text")} />
              {errors.text && (
                <FormErrorMessage>{errors.text.message}</FormErrorMessage>
              )}
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Fechar
          </Button>
          <Button
            colorScheme="green"
            type="submit"
            form="form"
            onClick={onClose}
          >
            Enviar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCommentModal;
