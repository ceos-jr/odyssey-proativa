import { SkeletonText, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { trpc } from "@utils/trpc";
const StatInProgModCard = () => {
  const modInProg = trpc.user.getNumModInProg.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  return (
    <Stat className="p-4 bg-white rounded-lg shadow-lg">
      {!modInProg.data && modInProg.data !== 0 ? (
        <SkeletonText noOfLines={5} />
      ) : (
        <>
          <StatLabel>Módulos em Progresso</StatLabel>
          <StatNumber>{modInProg.data ?? 0}</StatNumber>
        </>
      )}
    </Stat>
  );
};
export default StatInProgModCard;
