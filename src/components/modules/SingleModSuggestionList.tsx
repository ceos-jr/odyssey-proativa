import {
  Heading,
  Skeleton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Text,
  Highlight,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
  PopoverTrigger,
  Button,
  Portal,
  PopoverContent,
  PopoverCloseButton,
} from "@chakra-ui/react";
import useUpdateSuggestion from "@hooks/useUpdateSuggestion";
import { RouterTypes, trpc } from "@utils/trpc";
import { FaUserCircle } from "react-icons/fa";
import NextImage from "next/image";
import moment from "moment";

type ModSugg = RouterTypes["modSug"]["allByModuleId"]["output"];

interface ISuggestionTableProps {
  suggestions: ModSugg;
  handleChange: (id: string, readed: boolean) => void;
}

const SuggestionTable = ({
  suggestions,
  handleChange,
}: ISuggestionTableProps) => {
  return (
    <>
      {suggestions.length === 0 ? (
        <Text>
          <Highlight
            query="Nenhuma"
            styles={{
              px: "2",
              py: "1",
              rounded: "full",
              bg: "red.100",
            }}
          >
            Nenhuma sugestão encontrada
          </Highlight>
        </Text>
      ) : (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Usuário</Th>
                <Th isNumeric>Data</Th>
                <Th isNumeric>Ação</Th>
              </Tr>
            </Thead>
            <Tbody>
              {suggestions.map((sugg) => (
                <Tr key={sugg.id}>
                  <Td>
                    <div className="flex items-center gap-x-2">
                      <div className="relative h-8 w-8">
                        {sugg.user?.image ? (
                          <NextImage
                            src={sugg.user.image}
                            alt="user avatar"
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <FaUserCircle className="h-full w-full" />
                        )}
                      </div>
                      {sugg.user.name}
                    </div>
                  </Td>
                  <Td isNumeric>{moment(sugg.createdAt).fromNow()}</Td>
                  <Td
                    isNumeric
                    className="flex items-center justify-end gap-x-2"
                  >
                    <Popover>
                      <PopoverTrigger>
                        <Button>Ver</Button>
                      </PopoverTrigger>
                      <Portal>
                        <PopoverContent>
                          <PopoverArrow />
                          <PopoverHeader>
                            Sugestão de {sugg.user.name}
                          </PopoverHeader>
                          <PopoverCloseButton />
                          <PopoverBody>{sugg.text}</PopoverBody>
                        </PopoverContent>
                      </Portal>
                    </Popover>
                    <Button
                      colorScheme={`${sugg.readed ? "red" : "whatsapp"}`}
                      onClick={() => handleChange(sugg.id, sugg.readed)}
                    >
                      {sugg.readed
                        ? "Marcar como não lido"
                        : "Marcar como lido"}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

interface ISuggestionListProps {
  moduleId: string;
}

const SingleModSuggestionList = ({ moduleId }: ISuggestionListProps) => {
  const { data } = trpc.modSug.allByModuleId.useQuery(moduleId);
  const { changeSingleModule } = useUpdateSuggestion(undefined, moduleId);
  const filteredData = data?.filter((sugg) => !sugg.readed);

  const handleChange = (id: string, readed: boolean) => {
    changeSingleModule.mutate({ id, readed: !readed });
  };

  return (
    <div className="mt-8 flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
      <Heading>Sugestões</Heading>
      {!data ? (
        <>
          <Skeleton height="10" />
          <Skeleton height="10" />
          <Skeleton height="10" />
        </>
      ) : (
        <>
          <Tabs variant="soft-rounded">
            <TabList>
              <Tab _selected={{ color: "white", bg: "red.500" }}>Não lidos</Tab>
              <Tab _selected={{ color: "white", bg: "primary" }}>Todos</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <SuggestionTable
                  suggestions={filteredData as ModSugg}
                  handleChange={handleChange}
                />
              </TabPanel>
              <TabPanel>
                <SuggestionTable
                  suggestions={data}
                  handleChange={handleChange}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default SingleModSuggestionList;
