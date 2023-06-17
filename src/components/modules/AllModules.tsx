import {
  Skeleton,
  Button,
  Heading,
  SimpleGrid,
  Text,
  Highlight,
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
    <>
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
          <div className="flex flex-col justify-between gap-2 sm:flex-row">
            {" "}
            <Heading as="h1">Todos os Módulos</Heading>
            {session?.user?.role === Roles.Admin && (
              <NextLink href="/modules/create">
                {" "}
                <Button
                  colorScheme="whatsapp"
                  variant="solid"
                  className="hidden sm:inline-flex"
                  leftIcon={<BsJournalPlus />}
                >
                  Criar
                </Button>
              </NextLink>
            )}
          </div>
          {allModules.data.length === 0 ? (
            <Text>
              <Highlight
                query="ADMIN"
                styles={{ px: "2", py: "1", rounded: "full", bg: "red.300" }}
              >
                Nenhum módulo foi encontrado, fale com seu ADMIN para criar um
                novo
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
    </>
  );
};

export default AllModules;
