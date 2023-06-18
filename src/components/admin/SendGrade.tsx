import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import useCustomToast from "@hooks/useCustomToast";
import { trpc } from "@utils/trpc";
import { useState } from "react";
import { AiOutlineSend } from "react-icons/ai";

interface SendGradeProps {
  isOpen: boolean;
  onClose: () => void;
  cancelRef: React.MutableRefObject<null>;
  username: string;
  userId: string;
  taskname: string;
  taskId: string;
}

const SendGrade = ({
  username,
  taskname,
  userId,
  taskId,
  isOpen,
  onClose,
  cancelRef,
}: SendGradeProps) => {
  const { showErrorToast, showSuccessToast } = useCustomToast();
  const utils = trpc.useContext();
  const mutation = trpc.admin.attributeGrade.useMutation({
    async onMutate(data) {
      await utils.admin.getLatestSubmissions.cancel();
      const prevData = utils.admin.getLatestSubmissions.getData();
      const newData = prevData?.filter(
        (sub) => sub.taskId !== data.taskId || sub.userId !== data.userId
      );
      utils.admin.getLatestSubmissions.setData(newData);

      return { prevData };
    },
    onError(err, _, ctx) {
      utils.admin.getLatestSubmissions.setData(ctx?.prevData);
      showErrorToast(err.message, "Não foi possível atribuir uma nota");
    },
    onSuccess() {
      showSuccessToast(
        "A nota do usuário foi atualizada com sucesso",
        `A atividade do ${username} teve uma nota atribuida.`
      );
    },
  });
  const [grade, setGrade] = useState(3);
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
        <AlertDialogHeader>Atribuindo nota para a atividade</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody className="flex flex-col gap-4">
          <Text>
            Atribua uma nota entre <span className="font-bold">0 e 5</span> para
            a atividade <span className="font-bold">{taskname}</span> do usuário{" "}
            <span className="font-bold">{username}</span>
          </Text>
          <NumberInput
            max={5}
            min={0}
            precision={1}
            defaultValue={3}
            step={0.1}
            clampValueOnBlur={false}
            onChange={(value) => setGrade(parseFloat(value))}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            leftIcon={<AiOutlineSend />}
            isDisabled={grade < 0 || grade > 5}
            colorScheme="twitter"
            ml={3}
            onClick={() => {
              mutation.mutate({ taskId, userId, grade });
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

export default SendGrade;
