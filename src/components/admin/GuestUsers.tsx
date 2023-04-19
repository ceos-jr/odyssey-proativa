import {
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Skeleton,
  useToast,
} from "@chakra-ui/react";
import { trpc } from "@utils/trpc";
import { FaUserCircle } from "react-icons/fa";
import NextImage from "next/image";
import { BsFillHandThumbsDownFill, BsThreeDots } from "react-icons/bs";
import React, { useState } from "react";
import { BsFillHandThumbsUpFill } from "react-icons/bs";

const GuestUsers = () => {
  const toast = useToast();
  const utils = trpc.useContext();
  const guests = trpc.admin.getGuests.useQuery();

  const aproveUser = trpc.admin.aproveGuest.useMutation({
    async onMutate() {
      await utils.admin.getGuests.cancel();
      const prevData = utils.admin.getGuests.getData();
      const filtData = prevData?.filter((user) => user.id !== delUser.id);
      utils.admin.getGuests.setData(filtData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.admin.getGuests.setData(ctx?.prevData);
      toast({
        title: "Não foi possível aprovar o usuário",
        description: `Erro: ${err.message}`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess() {
      toast({
        title: "Usuário aprovado com sucesso.",
        description: `O usuário ${delUser.name} foi aprovado.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    },
  });

  const delUserMut = trpc.admin.delUser.useMutation({
    async onMutate() {
      await utils.admin.getGuests.cancel();
      const prevData = utils.admin.getGuests.getData();
      const filtData = prevData?.filter((user) => user.id !== delUser.id);
      utils.admin.getGuests.setData(filtData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.admin.getGuests.setData(ctx?.prevData);
      toast({
        title: "Não foi possível desaprovar o usuário",
        description: `Erro: ${err.message}`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    },
    onSuccess() {
      toast({
        title: "Usuário desaprovado com sucesso.",
        description: `O usuário ${delUser.name} foi desaprovado.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    },
  });

  const [delUser, setDelUser] = useState({ name: "", id: "" });

  return (
    <>
      {!guests.data ? (
        <>
          <Skeleton height="30px" />
          <Skeleton height="40" />
        </>
      ) : (
        <>
          <Heading>Membros não aprovados</Heading>
          {guests.data.length === 0 ? (
            <Text>Nenhum membro pendente a ser aprovado</Text>
          ) : (
            <TableContainer className="rounded-lg bg-white shadow-lg">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Usuário</Th>
                    <Th isNumeric>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {guests.data.map((mem) => (
                    <Tr key={mem.id}>
                      <Td>
                        <div className="flex items-center gap-x-2">
                          <div className="relative h-8 w-8">
                            {mem?.image ? (
                              <NextImage
                                src={mem.image}
                                alt="user avatar"
                                fill
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <FaUserCircle className="h-full w-full" />
                            )}
                          </div>
                          {mem.name}
                        </div>
                      </Td>
                      <Td className="flex justify-end">
                        <Menu>
                          <MenuButton as={IconButton} icon={<BsThreeDots />} />
                          <MenuList>
                            <MenuItem
                              icon={<BsFillHandThumbsUpFill />}
                              onClick={() => {
                                setDelUser({
                                  name: mem.name as string,
                                  id: mem.id,
                                });
                                aproveUser.mutateAsync(delUser.id);
                              }}
                            >
                              Aprovar
                            </MenuItem>
                            <MenuItem
                              icon={<BsFillHandThumbsDownFill />}
                              onClick={() => {
                                setDelUser({
                                  name: mem.name as string,
                                  id: mem.id,
                                });
                                delUserMut.mutateAsync(delUser.id);
                              }}
                            >
                              Desaprovar
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </>
  );
};

export default GuestUsers;
