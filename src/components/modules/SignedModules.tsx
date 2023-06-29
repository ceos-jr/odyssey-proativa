import { Heading, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import ModuleCard from "./ModuleCard";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";
import ModuleLoadingSke from "./ModuleLoadingSkeleton";


const SignedModules = () => {
  const userId = useRouter().query.userId as string;
  const ownedMod= trpc.admin.getOwnedMod.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  return (
    <>
      {!ownedMod.data ? (
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
          <Heading as="h1">Seus Modulos</Heading>
          {ownedMod.data.length === 0 ? (
            <Text>
              Você não possui nenhum modulo sob sua responsabilidade
            </Text>
          ) : (
            <SimpleGrid columns={{ sm: 2, md: 3, lg: 4 }} gap={6}>
              {ownedMod.data.map((mod) => (
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
    </>
  );
};

export default SignedModules;
