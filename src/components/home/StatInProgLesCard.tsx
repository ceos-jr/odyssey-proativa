import { SkeletonText, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { trpc } from "@utils/trpc";

const StatInProgLesCard = () => {
  const lesInProg = trpc.user.getLesInProg.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  return (
    <Stat className="p-4 bg-white rounded-lg shadow-lg">
      {!lesInProg.data ? (
        <SkeletonText noOfLines={5} />
      ) : (
        <>
          <StatLabel>Tópicos em Progresso</StatLabel>
          <StatNumber>{lesInProg.data.length}</StatNumber>
        </>
      )}
    </Stat>
  );
};
export default StatInProgLesCard;
