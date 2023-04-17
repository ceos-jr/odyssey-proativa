import {
  Badge,
  Button,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Roles, TaskStatus } from "@utils/constants";
import { useSession } from "@utils/useSession";
import NextLink from "next/link";
import { type RouterTypes } from "@utils/trpc";
import EditLessonMenu from "@components/lessons/EditLessonMenu";
import { AiOutlineEye } from "react-icons/ai";

interface LessonListProps {
  lessons: { id: string; name: string; tasks: { id: string }[] }[];
  userModRel: RouterTypes["module"]["getUserModStats"]["output"] | undefined;
}

const LessonList = ({ lessons, userModRel }: LessonListProps) => {
  const getLessStatus = (id: string) => {
    return (
      userModRel?.lessonProg.find((less) => less.lessonId === id)?.completed ??
      false
    );
  };

  const getUserCompTask = (lessonId: string) => {
    return (
      userModRel?.lessonProg
        .find((less) => less.lessonId === lessonId)
        ?.tasksProg.filter((task) => task.status === TaskStatus.Completed)
        .length ?? 0
    );
  };
  const { data: session } = useSession();
  return (
    <TableContainer>
      <Table colorScheme="blackAlpha" bgColor="white" rounded="md">
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Status</Th>
            <Th isNumeric>Atividades</Th>
            <Th isNumeric>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {lessons.map((lesson) => (
            <Tr key={lesson.id}>
              <Td className="flex gap-x-2 items-center">{lesson.name}</Td>
              <Td>
                {!userModRel ? (
                  "não inscrito"
                ) : getLessStatus(lesson.id) ? (
                  <Badge colorScheme="green">Completado</Badge>
                ) : (
                  <Badge colorScheme="red">Em progresso</Badge>
                )}
              </Td>
              <Td isNumeric>
                {!userModRel
                  ? lesson.tasks.length
                  : `${getUserCompTask(lesson.id)}/${lesson.tasks.length}`}
              </Td>
              <Td isNumeric>
                {userModRel && (
                  <NextLink href={`/lessons/${lesson.id}`} className="mr-2">
                    <Button leftIcon={<AiOutlineEye />}>Ver</Button>
                  </NextLink>
                )}
                {session?.user?.role === Roles.Admin && (
                  <EditLessonMenu lessonId={lesson.id} />
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default LessonList;
