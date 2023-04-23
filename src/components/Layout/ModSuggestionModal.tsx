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

export const SuggestionFormSchema = z.object({
  moduleId: z.string(),
  text: z
    .string()
    .min(1, { message: "O conteúdo da mensagem é necessário" })
    .max(250, { message: "Por favor, coloque algo mais sucinto" }),
});

export type SuggestionFormType = z.infer<typeof SuggestionFormSchema>;

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
}

const ModSuggestionModal = ({
  isOpen,
  onClose,
  moduleId,
}: SuggestionsModalProps) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<SuggestionFormType>({
    resolver: zodResolver(SuggestionFormSchema),
    mode: "onBlur",
  });

  const { showErrorToast, showSuccessToast } = useCustomToast();

  const createSugg = trpc.user.createModSugg.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não foi possível enviar a sugestão");
    },
    onSuccess() {
      showSuccessToast("A sugestão foi enviada com sucesso");
    },
  });

  const onSubmit = (data: SuggestionFormType) => {
    createSugg.mutate(data);
    reset({ moduleId, text: "" });
  };

  useEffect(() => {
    if (moduleId) reset({ moduleId, text: "" });
  }, [moduleId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent className="place-self-center self-center">
        <ModalHeader>
          Deixe sua sugestão para melhorarmos este módulo
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

export default ModSuggestionModal;
