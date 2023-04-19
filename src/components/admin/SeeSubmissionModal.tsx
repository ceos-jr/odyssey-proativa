import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from "@chakra-ui/react";
import DisplayMarkdown from "@components/Layout/DisplayMarkdown";

interface SeeTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskname: string;
  username: string;
  text: string;
}

const SeeSubmissionModal = ({
  isOpen,
  onClose,
  taskname,
  username,
  text,
}: SeeTaskModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
      <ModalOverlay />
      <ModalContent className="max-h-96 overflow-y-auto">
        <ModalHeader className="p-2">
          Atividade {taskname} de {username}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DisplayMarkdown text={text} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Fechar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SeeSubmissionModal;
