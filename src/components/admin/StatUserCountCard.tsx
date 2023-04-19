import { SkeletonText, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { trpc } from "@utils/trpc";

const StatUserCountCard = () => {
  const userCount = trpc.admin.getUserCount.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  return (
    <Stat className="rounded-lg bg-white p-4 shadow-lg">
      {!userCount.data && userCount.data !== 0 ? (
        <SkeletonText noOfLines={5} />
      ) : (
        <>
          <StatLabel>Quantidade de usuários</StatLabel>
          <StatNumber>{userCount.data}</StatNumber>
        </>
      )}
    </Stat>
  );
};

export default StatUserCountCard;
