import {
  Skeleton,
  Button,
  Heading,
  SimpleGrid,
  Text,
  Highlight,
  Box,
} from "@chakra-ui/react";
import { trpc } from "@utils/trpc";
import ModuleLoadingSke from "@components/modules/ModuleLoadingSkeleton";
import ModuleCard from "@components/modules/ModuleCard";
import { useSession } from "@utils/useSession";
import { Roles } from "@utils/constants";
import { BsJournalPlus } from "react-icons/bs";
import NextLink from "next/link";

const AllModules = () => {
  const allModules = trpc.module.getAll.useQuery();
  const { data: session } = useSession();

  return (
    <Box bg="yellow.300" p={4} rounded="lg" marginBottom="6">
      {!allModules.data ? (
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
          <Box display={{ base: "block", sm: "flex" }} justifyContent="space-between" alignItems={{ base: "initial", sm: "center" }} mb={2}>
            <Heading as="h1" mr={{ base: 0, sm: 4 }}>Todos os Módulos</Heading>
            {session?.user?.role === Roles.Admin && (
              <NextLink href="/modules/create">
                <Button
                  variant="solid"
                  display={{ base: "block", sm: "inline-flex" }}
                  leftIcon={<BsJournalPlus />}
                  color="black"
                  borderColor="black"
                  bg="green.300"
                  borderWidth="1px"
                  _hover={{ bg: "green.400" }}
                  _active={{ bg: "green.500" }}
                  mt={{ base: 2, sm: 0 }}
                >
                  Criar
                </Button>
              </NextLink>
            )}
          </Box>
          {allModules.data.length === 0 ? (
            <Text>
              <Highlight
                query="ADMIN"
                styles={{ px: "2", py: "1", rounded: "full", bg: "red.300" }}
              >
                Nenhum módulo foi encontrado, fale com seu ADMIN para criar um novo
              </Highlight>
            </Text>
          ) : (
            <SimpleGrid columns={{ sm: 2, md: 3, lg: 4 }} gap={6}>
              {allModules?.data.map((module) => (
                <ModuleCard
                  id={module.id}
                  name={module.name}
                  description={module?.description}
                  key={module.id}
                  updatedAt={module.updatedAt}
                />
              ))}
            </SimpleGrid>
          )}
        </>
      )}
    </Box>
  );
};

export default AllModules;
