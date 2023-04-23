import {
  Button,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import useUpdateSuggestion from "@hooks/useUpdateSuggestion";
import { type ModSuggestion, type LesSuggestion } from "@prisma/client";

type Module = ModSuggestion & { module: { name: string } };
type Lesson = LesSuggestion & { lesson: { name: string } };

interface IUserSuggestionProps {
  title: string;
  data: (Module | Lesson)[] | undefined;
}

const SeenButton = ({ sugg }: { sugg: Module | Lesson }) => {
  const { changeModForUser, changeLesForUser } = useUpdateSuggestion(
    sugg.userId
  );
  return (
    <Button
      colorScheme={`${sugg.readed ? "red" : "green"}`}
      onClick={() => {
        if (isModule(sugg)) changeModForUser.mutate(sugg);
        else changeLesForUser.mutate(sugg);
      }}
    >
      {sugg.readed ? "Marcar como não lido" : "Marcar como lido"}
    </Button>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isModule = (x: any): x is Module => "module" in x;

const UserSuggestions = ({ title, data }: IUserSuggestionProps) => {
  return (
    <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
      <Heading>{title}</Heading>
      {!data ? (
        <Skeleton height="60px" />
      ) : data.length === 0 ? (
        <Text>Nenhuma sugestão recente registrada</Text>
      ) : (
        <TableContainer whiteSpace="break-spaces">
          <Table>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((sugg) => {
                return (
                  <Tr key={sugg.id}>
                    <Td>
                      <Text>
                        {isModule(sugg)
                          ? (sugg as Module).module.name
                          : (sugg as Lesson).lesson.name}
                      </Text>
                    </Td>
                    <Td className="flex flex-wrap items-center justify-center gap-2">
                      <Popover>
                        <PopoverTrigger>
                          <Button>Ver</Button>
                        </PopoverTrigger>
                        <Portal>
                          <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverBody>{sugg.text}</PopoverBody>
                          </PopoverContent>
                        </Portal>
                      </Popover>
                      <SeenButton sugg={sugg} />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default UserSuggestions;
