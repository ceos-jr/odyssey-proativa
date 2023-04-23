import {
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useDisclosure,
  Skeleton,
} from "@chakra-ui/react";
import { FaUserCircle } from "react-icons/fa";
import NextImage from "next/image";
import { type RouterTypes, trpc } from "@utils/trpc";
import { BsThreeDots } from "react-icons/bs";
import { AiOutlineEye, AiOutlineSend, AiOutlineStar } from "react-icons/ai";
import { useRef, useState } from "react";
import SendGrade from "./SendGrade";
import SeeSubmissionModal from "./SeeSubmissionModal";
import ShowTaskModal from "@components/lessons/ShowTaskModal";

type UserSubmissionOutput = Pick<
  RouterTypes["admin"]["getLatestSubmissions"]["output"][0],
  "task" | "userId" | "richText"
>;
type SubmissionData = UserSubmissionOutput & {
  username: string;
};

const UserSubmissions = () => {
  const lastSubmissions = trpc.admin.getLatestSubmissions.useQuery();
  const [subData, setSubData] = useState<SubmissionData | null>(null);
  const gradeAlert = useDisclosure();
  const submModal = useDisclosure();
  const taskModal = useDisclosure();
  const cancelRef = useRef(null);
  return (
    <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
      {!lastSubmissions.data ? (
        <UserSubmissionSkeleton />
      ) : (
        <>
          <SendGrade
            userId={subData?.userId ?? ""}
            taskId={subData?.task?.id ?? ""}
            onClose={gradeAlert.onClose}
            isOpen={gradeAlert.isOpen}
            cancelRef={cancelRef}
            username={subData?.username ?? ""}
            taskname={subData?.task?.name ?? ""}
          />
          <SeeSubmissionModal
            isOpen={submModal.isOpen}
            onClose={submModal.onClose}
            username={subData?.username ?? ""}
            taskname={subData?.task?.name ?? ""}
            text={subData?.richText ?? ""}
          />
          <ShowTaskModal
            isOpen={taskModal.isOpen}
            onClose={taskModal.onClose}
            task={subData?.task ?? null}
          />
          <Heading>Envio dos usuários</Heading>
          {lastSubmissions.data.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <Text>Nenhuma submissão recente foi encontrada</Text>
            </div>
          ) : (
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Usuário</Th>
                    <Th>Atividade</Th>
                    <Th isNumeric>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {lastSubmissions.data.map((sub) => (
                    <Tr key={sub.taskId}>
                      <Td>
                        <div className="flex items-center gap-x-2">
                          <div className="relative h-8 w-8">
                            {sub?.user.image ? (
                              <NextImage
                                src={sub.user.image}
                                alt="user avatar"
                                fill
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <FaUserCircle className="h-full w-full" />
                            )}
                          </div>
                          {sub.user.name}
                        </div>
                      </Td>
                      <Td>{sub.task.name}</Td>
                      <Td className="flex justify-end">
                        <Menu>
                          <MenuButton as={IconButton} icon={<BsThreeDots />} />
                          <MenuList>
                            <MenuItem
                              icon={<AiOutlineEye />}
                              onClick={() => {
                                setSubData({
                                  userId: sub.userId,
                                  username: sub.user.name ?? "",
                                  richText: sub.richText ?? "",
                                  task: sub.task,
                                });
                                taskModal.onOpen();
                              }}
                            >
                              Ver atividade
                            </MenuItem>
                            <MenuItem
                              icon={<AiOutlineSend />}
                              onClick={() => {
                                setSubData({
                                  userId: sub.userId,
                                  username: sub.user.name ?? "",
                                  richText: sub.richText ?? "",
                                  task: sub.task,
                                });
                                submModal.onOpen();
                              }}
                            >
                              Ver envio
                            </MenuItem>
                            <MenuItem
                              icon={<AiOutlineStar />}
                              onClick={() => {
                                setSubData({
                                  userId: sub.userId,
                                  username: sub.user.name ?? "",
                                  richText: sub.richText ?? "",
                                  task: sub.task,
                                });
                                gradeAlert.onOpen();
                              }}
                            >
                              Atribuir nota
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
    </div>
  );
};

const UserSubmissionSkeleton = () => {
  return (
    <>
      <Skeleton height="10" />
      <Skeleton height="32" />
    </>
  );
};

export default UserSubmissions;
