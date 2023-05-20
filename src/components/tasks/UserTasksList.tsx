import {
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Badge,
  useDisclosure,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { TaskStatus } from "@utils/constants";
import { AiOutlineEye, AiOutlineSend } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import ShowTaskModal from "@components/lessons/ShowTaskModal";
import SubmitTaskAlert from "@components/lessons/SubmitTaskAlert";
import { type RouterTypes } from "@utils/trpc";
import React, { useState } from "react";

type TasksType = NonNullable<
  RouterTypes["lesson"]["getLesson"]["output"]
>["tasks"];

type TasksProgress = NonNullable<
  RouterTypes["task"]["getTasksByUser"]["output"]
>;

interface UserTasksListProps {
  tasksProgress: TasksProgress;
}

const UserTasksList = ({ tasksProgress }: UserTasksListProps) => {
  const [task, setTask] = useState<TasksType[0] | null>(null);
  const sendTaskAle = useDisclosure();
  const taskModal = useDisclosure();
  const cancelRef = React.useRef(null);

  const getSubmitedText = (taskId: string) => {
    return tasksProgress.find((uTask) => uTask.taskId === taskId)?.richText;
  };

  return (
    <>
      <ShowTaskModal
        task={task}
        isOpen={taskModal.isOpen}
        onClose={taskModal.onClose}
      />
      <SubmitTaskAlert
        isOpen={sendTaskAle.isOpen}
        onClose={sendTaskAle.onClose}
        task={task}
        cancelRef={cancelRef}
        initialData={getSubmitedText(task?.id ?? "")}
      />
      <Table>
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Status</Th>
            <Th isNumeric>Nota</Th>
            <Th isNumeric>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasksProgress.map((progress) => {
            return (
              <Tr key={progress.taskId}>
                <Td>{progress.task.name}</Td>
                <Td>
                  {tasksProgress && progress.status === TaskStatus.Completed ? (
                    <Badge colorScheme="green">Completado</Badge>
                  ) : progress.status === TaskStatus.Submitted ? (
                    <Badge colorScheme="purple">Submetido</Badge>
                  ) : (
                    <Badge colorScheme="red">Pendente</Badge>
                  )}
                </Td>
                <Td isNumeric>
                  {progress.grade !== null ? progress.grade : "sem nota"}
                </Td>
                <Td isNumeric>
                  <Menu>
                    <MenuButton as={IconButton} icon={<BsThreeDots />} />
                    <MenuList>
                      <MenuItem
                        icon={<AiOutlineSend />}
                        isDisabled={
                          progress.status === TaskStatus.Completed
                            ? true
                            : false
                        }
                        onClick={() => {
                          setTask(progress.task);
                          sendTaskAle.onOpen();
                        }}
                      >
                        Enviar Solução
                      </MenuItem>
                      <MenuItem
                        icon={<AiOutlineEye />}
                        onClick={() => {
                          setTask(progress.task);
                          taskModal.onOpen();
                        }}
                      >
                        Visualizar Atividade
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </>
  );
};

export default UserTasksList;
