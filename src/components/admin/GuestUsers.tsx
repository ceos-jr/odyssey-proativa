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
} from "@chakra-ui/react";
import { trpc } from "@utils/trpc";
import { FaUserCircle } from "react-icons/fa";
import NextImage from "next/image";
import { BsFillHandThumbsDownFill, BsThreeDots } from "react-icons/bs";
import React, { useState } from "react";
import { BsFillHandThumbsUpFill } from "react-icons/bs";
import useCustomToast from "@hooks/useCustomToast";

const GuestUsers = () => {
  const utils = trpc.useContext();
  const guests = trpc.admin.getGuests.useQuery();
  const { showErrorToast, showSuccessToast } = useCustomToast();

  const aproveUser = trpc.admin.aproveGuest.useMutation({
    async onMutate(aproveId) {
      await utils.admin.getGuests.cancel();
      const prevData = utils.admin.getGuests.getData();
      const filtData = prevData?.filter((user) => user.id !== aproveId);
      utils.admin.getGuests.setData(filtData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.admin.getGuests.setData(ctx?.prevData);
      showErrorToast(err.message, "Não foi possível aprovar o usuário");
    },
    onSuccess() {
      utils.admin.getAllMembers.refetch();
      showSuccessToast(
        "Usuário aprovado com sucesso.",
        `O usuário ${username} foi aprovado.`
      );
    },
  });

  const delUserMut = trpc.admin.delUser.useMutation({
    async onMutate(delId) {
      await utils.admin.getGuests.cancel();
      const prevData = utils.admin.getGuests.getData();
      const filtData = prevData?.filter((user) => user.id !== delId);
      utils.admin.getGuests.setData(filtData);
      return { prevData };
    },
    onError(err, _, ctx) {
      utils.admin.getGuests.setData(ctx?.prevData);
      showErrorToast(err.message, "Não foi possível desaprovar o usuário");
    },
    onSuccess() {
      showSuccessToast(
        "Usuário desaprovado com sucesso.",
        `O usuário ${username} foi desaprovado.`
      );
    },
  });

  const [username, setUsername] = useState("");

  return (
    <div className="flex flex-col gap-8 rounded-lg bg-white p-8 shadow-lg">
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
            <TableContainer>
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
                                setUsername(mem.name as string);
                                aproveUser.mutateAsync(mem.id);
                              }}
                            >
                              Aprovar
                            </MenuItem>
                            <MenuItem
                              icon={<BsFillHandThumbsDownFill />}
                              onClick={() => {
                                setUsername(mem.name as string);
                                delUserMut.mutateAsync(mem.id);
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
    </div>
  );
};

export default GuestUsers;
