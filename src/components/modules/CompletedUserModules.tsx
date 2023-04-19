import { Heading, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import ModProgCard from "@components/home/ModProgCard";
import { trpc } from "@utils/trpc";
import ModuleLoadingSke from "./ModuleLoadingSkeleton";

const CompletedUserModules = () => {
  const compUserMod = trpc.user.getCompMod.useQuery();
  return (
    <>
      {!compUserMod.data ? (
        <>
          <Skeleton height="40px" />
          <SimpleGrid columns={{ sm: 2, md: 3, lg: 4 }} gap={6}>
            <ModuleLoadingSke /> <ModuleLoadingSke />
            <ModuleLoadingSke />
            <ModuleLoadingSke />
          </SimpleGrid>
        </>
      ) : (
        <>
          {" "}
          <Heading as="h1">Módulos completados</Heading>
          {compUserMod.data.length === 0 ? (
            <Text>Nenhum módulo completado foi encontrado</Text>
          ) : (
            <SimpleGrid columns={{ sm: 2, md: 3, lg: 4 }} gap={6}>
              {compUserMod.data.map((mod) => (
                <ModProgCard
                  key={`${mod.moduleId}_unf`}
                  name={mod.module.name}
                  description={mod.module.description}
                  id={mod.moduleId}
                  lastTimeSeen={mod.lastTimeSeen}
                  lessonProg={mod.lessonProg}
                  completed={mod.completed}
                />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </>
  );
};

export default CompletedUserModules;
