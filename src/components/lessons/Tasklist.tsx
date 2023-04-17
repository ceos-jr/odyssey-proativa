import {
  Table,
  TableContainer,
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
  Skeleton,
  Heading,
  Highlight,
  Text,
} from "@chakra-ui/react";
import { TaskStatus } from "@utils/constants";
import { trpc, type RouterTypes } from "@utils/trpc";
import React, { useState } from "react";
import { AiOutlineEye, AiOutlineSend } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import ShowTaskModal from "./ShowTaskModal";
import SubmitTaskAlert from "./SubmitTaskAlert";

type TasksType = NonNullable<
  RouterTypes["lesson"]["getLesson"]["output"]
>["tasks"];

interface TasklistProps {
  lessonId: string;
  tasks: TasksType;
}

const Tasklist = ({ lessonId, tasks }: TasklistProps) => {
  const { data: userTasksStts } = trpc.user.getTasks4Less.useQuery(lessonId);
  const [task, setTask] = useState<TasksType[0] | null>(null);
  const sendTaskAle = useDisclosure();
  const taskModal = useDisclosure();
  const cancelRef = React.useRef(null);

  const getTaskStatus = (taskId: string) => {
    return userTasksStts?.find((uTask) => uTask.taskId === taskId)
      ?.status as TaskStatus;
  };

  const getGrade = (taskId: string) => {
    return userTasksStts?.find((uTask) => uTask.taskId === taskId)?.grade;
  };

  const getSubmitedText = (taskId: string) => {
    return userTasksStts?.find((uTask) => uTask.taskId === taskId)?.richText;
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
      {!userTasksStts ? (
        <>
          <Skeleton height="40px" />
          <Skeleton height="36" />
        </>
      ) : (
        <>
          <Heading>Atividades</Heading>
          {tasks.length === 0 ? (
            <div className="flex flex-col justify-center items-center p-16 bg-white rounded-lg shadow-lg">
              <Text>
                {" "}
                Nenhuma atividade foi disponibilizada para esse tópico
              </Text>
              <Text>
                {" "}
                Entre em contato com seu{" "}
                <Highlight
                  query="ADMIN"
                  styles={{
                    px: "2",
                    py: "1",
                    rounded: "full",
                    bg: "secondary",
                  }}
                >
                  ADMIN
                </Highlight>{" "}
                para adicionar uma atividade ou mande uma sugestão
              </Text>
            </div>
          ) : (
            <TableContainer className="bg-white rounded-lg shadow-lg">
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
                  {tasks.map((task) => (
                    <Tr key={task.id}>
                      <Td>{task.name}</Td>
                      <Td>
                        {userTasksStts &&
                        getTaskStatus(task.id) === TaskStatus.Completed ? (
                          <Badge colorScheme="green">Completado</Badge>
                        ) : getTaskStatus(task.id) === TaskStatus.Submitted ? (
                          <Badge colorScheme="purple">Submetido</Badge>
                        ) : (
                          <Badge colorScheme="red">Pendente</Badge>
                        )}
                      </Td>
                      <Td isNumeric>
                        {getGrade(task.id) ? getGrade(task.id) : "sem nota"}
                      </Td>
                      <Td isNumeric>
                        <Menu>
                          <MenuButton as={IconButton} icon={<BsThreeDots />} />
                          <MenuList>
                            <MenuItem
                              icon={<AiOutlineSend />}
                              isDisabled={
                                getTaskStatus(task.id) === TaskStatus.Completed
                                  ? true
                                  : false
                              }
                              onClick={() => {
                                setTask(task);
                                sendTaskAle.onOpen();
                              }}
                            >
                              Enviar Solução
                            </MenuItem>
                            <MenuItem
                              icon={<AiOutlineEye />}
                              onClick={() => {
                                setTask(task);
                                taskModal.onOpen();
                              }}
                            >
                              Visualizar Atividade
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </>
  );
};

export default Tasklist;
