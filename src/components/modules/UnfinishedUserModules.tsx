import { Box, Heading, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import ModProgCard from "@components/home/ModProgCard";
import { trpc } from "@utils/trpc";
import ModuleLoadingSke from "./ModuleLoadingSkeleton";
import type ColorPattern from "../../pages/modules/index";

const UnfinishedUserModules = ({ color }: ColorPattern) => {
  const unfUserMod = trpc.user.getUnfMod.useQuery();

  return (
    <Box p={4} borderRadius="md" bg={color.bg} marginBottom="6">
      {!unfUserMod.data ? (
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
          <Heading as="h1" color={color.text} mb={4}>
            Módulos não completados
          </Heading>
          {unfUserMod.data.length === 0 ? (
            <Text color={color.text}>
              Nenhum módulo não completado foi encontrado, por favor se inscreva
              em um módulo
            </Text>
          ) : (
            <SimpleGrid columns={{ sm: 2, md: 3, lg: 4 }} gap={6}>
              {unfUserMod.data.map((mod) => (
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
    </Box>
  );
};

export default UnfinishedUserModules;
