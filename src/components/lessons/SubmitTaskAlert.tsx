import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogOverlay,
  AlertDialogContent,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import AutoResizeTextarea from "@components/Layout/AutoResizeTextarea";
import useCustomToast from "@hooks/useCustomToast";
import { type Task } from "@prisma/client";
import { trpc } from "@utils/trpc";
import { useState } from "react";
import { AiOutlineSend } from "react-icons/ai";

interface SubmitTaskAlertProps {
  task: Task | null;
  isOpen: boolean;
  initialData?: string | null;
  onClose: () => void;
  cancelRef: React.MutableRefObject<null>;
}

const SubmitTaskAlert = ({
  task,
  isOpen,
  onClose,
  cancelRef,
  initialData,
}: SubmitTaskAlertProps) => {
  const { showErrorToast, showSuccessToast } = useCustomToast();

  const utils = trpc.useContext();
  const mutation = trpc.user.submitTask.useMutation({
    onError(err) {
      showErrorToast(err.message, "Não foi possível submeter a atividade");
    },
    onSuccess() {
      showSuccessToast(
        "A atividade foi submetida com sucesso",
        `A atividade ${task?.name} foi submetida.`
      );
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      utils.user.getTasks4Less.refetch(task!.lessonId);
    },
  });
  const [message, setMessage] = useState(initialData);

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
      size="6xl"
    >
      <AlertDialogOverlay />
      <AlertDialogContent className="max-h-96 overflow-y-auto">
        <AlertDialogHeader>Atividade {task?.name}</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          <FormControl
            id="message"
            isRequired
            isInvalid={!!message && message.length < 1}
          >
            <FormLabel>Messagem</FormLabel>
            <AutoResizeTextarea onChange={(e) => setMessage(e.target.value)}>
              {initialData}
            </AutoResizeTextarea>
            <FormErrorMessage>
              O conteúdo da mensagem é obrigatório
            </FormErrorMessage>
          </FormControl>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            leftIcon={<AiOutlineSend />}
            colorScheme="red"
            ml={3}
            onClick={() => {
              mutation.mutate({
                id: task?.id as string,
                richText: message as string,
              });
              setMessage("");
              onClose();
            }}
          >
            Enviar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SubmitTaskAlert;
