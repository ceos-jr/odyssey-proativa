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
import React from "react";

interface DeleteLessonAlertProps {
  isOpen: boolean;
  onClickToDelete: () => void;
  onClose: () => void;
}

const DeleteLessonAlert = ({
  isOpen,
  onClickToDelete,
  onClose,
}: DeleteLessonAlertProps) => {
  const cancelRef = React.useRef(null);

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
        <AlertDialogHeader>Deletar o tópico</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody>
          Você tem certeza que deseja deletar esse tópico? Essa ação não pode
          ser desfeita
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            Não
          </Button>
          <Button colorScheme="red" ml={3} onClick={onClickToDelete}>
            Sim
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteLessonAlert;
