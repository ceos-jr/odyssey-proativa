import { trpc } from "@utils/trpc";
import { SkeletonText, Stat, StatLabel, StatNumber } from "@chakra-ui/react";

const StatInProgTasksCard = () => {
  const tasksInProg = trpc.user.getTaskInProg.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  return (
    <Stat className="rounded-lg bg-white p-4 shadow-lg">
      {!tasksInProg.data ? (
        <SkeletonText noOfLines={5} />
      ) : (
        <>
          <StatLabel>Atividades não terminadas</StatLabel>
          <StatNumber>{tasksInProg.data.length}</StatNumber>
        </>
      )}
    </Stat>
  );
};

export default StatInProgTasksCard;
