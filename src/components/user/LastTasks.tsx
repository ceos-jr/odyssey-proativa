import {
  Heading,
  Table,
  TableContainer,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Skeleton,
  Text,
  Divider,
  SkeletonCircle,
} from "@chakra-ui/react";
import TaskStatusIndicator from "@components/Layout/TaskStatusIndicator";
import { type UserTaskProgress } from "@prisma/client";

type TaskList = (UserTaskProgress & { task: { name: string } })[] | undefined;

interface ILastTasksProps {
  tasks: TaskList;
  finishedCount?: number;
  totalCount?: number;
}

const Header = ({ tCount, fCount }: { tCount?: number; fCount?: number }) => {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row">
      <div>
        <Heading>Últimas atividades</Heading>
        {tCount !== undefined ? (
          <Text>
            <span className="font-bold">{tCount}</span> no total
          </Text>
        ) : (
          <Skeleton marginTop="10px" height="10px" className="w-1/2" />
        )}
      </div>
      <div className="flex items-center justify-between gap-8">
        <div className="flex flex-col items-center space-y-2">
          {fCount !== undefined ? (
            <span className="text-3xl font-bold">{fCount}</span>
          ) : (
            <SkeletonCircle />
          )}{" "}
          Terminadas
        </div>
        <div className="flex flex-col items-center space-y-2 text-center">
          {fCount !== undefined && tCount !== undefined ? (
            <span className="text-3xl font-bold">{tCount - fCount}</span>
          ) : (
            <SkeletonCircle />
          )}{" "}
          Em Progresso
        </div>
      </div>
    </div>
  );
};

const LastTasks = ({ tasks, totalCount, finishedCount }: ILastTasksProps) => {
  return (
    <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
      <Header tCount={totalCount} fCount={finishedCount} />
      {!tasks ? (
        <LoadingSkeleton />
      ) : (
        <TableContainer>
          <Divider orientation="horizontal" />
          <Table>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Status</Th>
                <Th isNumeric>Nota</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tasks.map((task) => (
                <Tr key={task.taskId}>
                  <Td>{task.task.name}</Td>
                  <Td>
                    <TaskStatusIndicator status={task.status} />
                  </Td>
                  <Td isNumeric>
                    {task.grade !== null ? task.grade : "sem nota"}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default LastTasks;

const LoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton height="30px" />
      <Skeleton height="30px" />
      <Skeleton height="30px" />
    </div>
  );
};
