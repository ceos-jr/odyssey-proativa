import { SkeletonText, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { trpc } from "@utils/trpc";

const StatLessCountCard = () => {
  const lessonCount = trpc.admin.getLessCount.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  return (
    <Stat className="rounded-lg bg-white p-4 shadow-lg">
      {!lessonCount.data && lessonCount.data !== 0 ? (
        <SkeletonText noOfLines={5} />
      ) : (
        <>
          <StatLabel>Quantidade de tópicos criados</StatLabel>
          <StatNumber>{lessonCount.data}</StatNumber>
        </>
      )}
    </Stat>
  );
};

export default StatLessCountCard;
