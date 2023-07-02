import { Box, Heading, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import { trpc } from "@utils/trpc";
import React from "react";
import ModuleCard from "./ModuleCard";
import ModuleLoadingSke from "./ModuleLoadingSkeleton";
import { ColorPattern } from "../../pages/modules/index";

const SignedModules = ({color}:{color: ColorPattern}) => {
  const signedModules = trpc.admin.getSignedModules.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <Box p={4} bg={color.bg} rounded="lg" marginBottom="6">
      {!signedModules.data ? (
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
          <Heading as="h1" color={color.text}>
            Seus Modulos
          </Heading>
          {signedModules.data.length === 0 ? (
            <Text color={color.text}>
              Você não possui nenhum módulo sob sua responsabilidade
            </Text>
          ) : (
            <SimpleGrid columns={{ sm: 2, md: 3, lg: 4 }} gap={6}>
              {signedModules.data.map((mod) => (
                <ModuleCard
                  id={mod.id}
                  name={mod.name}
                  description={mod?.description}
                  key={mod.id}
                  updatedAt={mod.updatedAt}
                />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Box>
  );
};

export default SignedModules;
