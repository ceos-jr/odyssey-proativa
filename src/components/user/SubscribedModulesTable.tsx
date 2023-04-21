import {
  Heading,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  Button,
  Divider,
} from "@chakra-ui/react";
import { type UserModuleProgress } from "@prisma/client";
import moment from "moment";
import NextLink from "next/link";
import { AiOutlineEye } from "react-icons/ai";

type ModuleList =
  | (UserModuleProgress & { module: { name: string } })[]
  | undefined;

const SubscribedModulesTable = ({ modules }: { modules: ModuleList }) => {
  return (
    <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
      <Heading>Módulos Inscritos</Heading>
      {!modules ? (
        <LoadingSkeleton />
      ) : (
        <TableContainer>
          <Divider />
          <Table>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Início</Th>
                <Th>Fim</Th>
                <Th isNumeric>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {modules.map((mod) => (
                <Tr key={mod.moduleId}>
                  <Td>{mod.module.name}</Td>
                  <Td>{moment(mod.startedAt).format("L")}</Td>
                  <Td>
                    {mod.completed
                      ? moment(mod.completedAt).format("L")
                      : "não completado"}
                  </Td>
                  <Td isNumeric>
                    {" "}
                    <NextLink
                      href={`/modules/${mod.moduleId}`}
                      className="mr-2"
                    >
                      <Button leftIcon={<AiOutlineEye />}>Ver</Button>
                    </NextLink>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default SubscribedModulesTable;

const LoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton height="30px" />
      <Skeleton height="30px" />
      <Skeleton height="30px" />
    </div>
  );
};
