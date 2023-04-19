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
  useToast,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@utils/trpc";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const LessSuggestionSchema = z.object({
  lessonId: z.string(),
  text: z
    .string()
    .min(1, { message: "O conteúdo da mensagem é necessário" })
    .max(250, { message: "Por favor, coloque algo mais sucinto" }),
});

export type LessSuggFormType = z.infer<typeof LessSuggestionSchema>;

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
}

const LessSuggestionModal = ({
  isOpen,
  onClose,
  lessonId,
}: SuggestionsModalProps) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<LessSuggFormType>({
    resolver: zodResolver(LessSuggestionSchema),
    mode: "onBlur",
  });

  const toast = useToast();
  const createSugg = trpc.user.createLessSugg.useMutation({
    onError(err) {
      toast({
        title: "Não foi possível enviar a sugestão",
        description: `Erro: ${err.message}`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess() {
      toast({
        title: "A sugestão foi enviada com sucesso",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
  });

  const onSubmit = (data: LessSuggFormType) => {
    createSugg.mutate(data);
    reset({ lessonId, text: "" });
  };

  useEffect(() => {
    if (lessonId) reset({ lessonId, text: "" });
  }, [lessonId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent className="place-self-center self-center">
        <ModalHeader>
          Deixe sua sugestão para melhorarmos este tópico
        </ModalHeader>
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

export default LessSuggestionModal;
