import { Heading, SkeletonText, Skeleton, Text } from "@chakra-ui/react";
import { trpc } from "@utils/trpc";
import ModProgCard from "./ModProgCard";

const MostRecentModules = () => {
  const mostRecent = trpc.user.getMostRecentMod.useQuery(3);
  return (
    <div className="flex flex-col gap-4">
      {!mostRecent.data ? (
        <>
          <MostRecentModSkel />
        </>
      ) : (
        <>
          <Heading>Módulos mais recentes</Heading>
          {mostRecent.data.length === 0 ? (
            <Text>
              Você não tem nenhum módulo recente, vá na aba módulos e se
              inscreva em algum
            </Text>
          ) : (
            <div className="grid grid-cols-1 place-content-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mostRecent.data.map((mod) => (
                <ModProgCard
                  key={mod.moduleId}
                  name={mod.module.name}
                  id={mod.moduleId}
                  lastTimeSeen={mod.lastTimeSeen}
                  description={mod.module.description}
                  lessonProg={mod.lessonProg}
                  completed={mod.completed}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MostRecentModules;

const MostRecentModSkel = () => {
  return (
    <>
      <Skeleton height="30px" />
      <div className="grid grid-cols-3 gap-4">
        <SkeletonText noOfLines={4} />
        <SkeletonText noOfLines={4} />
        <SkeletonText noOfLines={4} />
      </div>
    </>
  );
};
