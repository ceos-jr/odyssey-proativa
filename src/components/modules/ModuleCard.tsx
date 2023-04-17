import { Heading, Box, LinkBox, LinkOverlay, Text } from "@chakra-ui/react";
import moment from "moment";
import NextLink from "next/link";
import "moment/locale/pt-br";
import { trpc } from "@utils/trpc";
moment.locale("pt-br");

type ModuleCardProps = {
  id: string;
  name: string;
  updatedAt: Date;
  description: string | null;
};

export const ModuleCard = ({ name, description, id }: ModuleCardProps) => {
  const updateLastSeen = trpc.user.updModLastSeen.useMutation();
  return (
    <NextLink href={`/modules/${id}`} onClick={() => updateLastSeen.mutate(id)}>
      <LinkBox
        as="article"
        maxW="sm"
        p="5"
        h="full"
        borderWidth="1px"
        rounded="md"
        bg="white"
        role="group"
        className="shadow-lg"
      >
        <Heading
          size="md"
          my="2"
          _groupHover={{ color: "secondary" }}
          className="transition-colors"
        >
          <LinkOverlay href={`/modules/${id}`}>{name}</LinkOverlay>
        </Heading>
        <Text>{description && description}</Text>
      </LinkBox>
    </NextLink>
  );
};

export default ModuleCard;
