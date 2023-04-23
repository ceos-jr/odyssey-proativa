import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogCloseButton,
  Button,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import useCustomToast from "@hooks/useCustomToast";
import { trpc } from "@utils/trpc";
import React from "react";

interface DeleteTaskAlertProps {
  lessonId: string;
  taskId: string;
  name: string;
  isOpen: boolean;
  onClose: () => void;
}

const DeleteTaskAlert = ({
  name,
  taskId,
  isOpen,
  onClose,
  lessonId,
}: DeleteTaskAlertProps) => {
  const cancelRef = React.useRef(null);
  const { showErrorToast, showSuccessToast } = useCustomToast();

  const utils = trpc.useContext();
  const deleteTask = trpc.task.deleteTask.useMutation({
    async onMutate() {
      await utils.lesson.getLessTasks.cancel({ lessonId });
      const prevData = utils.lesson.getLessTasks.getData({ lessonId });
      const filtData = prevData?.filter((task) => task.id !== taskId);
      utils.lesson.getLessTasks.setData(filtData, { lessonId });

      return { prevData };
    },
    onError(err, _, ctx) {
      utils.lesson.getLessTasks.setData(ctx?.prevData, { lessonId });
      showErrorToast(err.message, "Não foi possível deletar a atividade");
    },
    onSuccess() {
      showSuccessToast("A atividade foi deletada com sucesso");
    },
  });

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>Deletar a atividade {name}?</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          Você tem certeza que deseja deletar essa atividade? Essa ação não pode
          ser desfeita
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            Não
          </Button>
          <Button
            colorScheme="red"
            ml={3}
            onClick={() => {
              deleteTask.mutate(taskId);
              onClose();
            }}
          >
            Sim
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTaskAlert;
