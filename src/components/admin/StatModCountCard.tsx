import { SkeletonText, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { trpc } from "@utils/trpc";

const StatModCountCard = () => {
  const moduleCount = trpc.admin.getModCount.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  return (
    <Stat className="p-4 bg-white rounded-lg shadow-lg">
      {!moduleCount.data && moduleCount.data !== 0 ? (
        <SkeletonText noOfLines={5} />
      ) : (
        <>
          <StatLabel>Quantidade de módulos criados</StatLabel>
          <StatNumber>{moduleCount.data}</StatNumber>
        </>
      )}
    </Stat>
  );
};

export default StatModCountCard;
