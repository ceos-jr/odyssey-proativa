import {
  Text,
  Highlight,
  List,
  ListItem,
  Heading,
  ListIcon,
} from "@chakra-ui/react";
import { type Link } from "@prisma/client";
import { BsGlobe } from "react-icons/bs";
import NextLink from "next/link";

interface LinkListProps {
  links: Link[];
}

const LinkList = ({ links }: LinkListProps) => {
  return (
    <>
      {links.length !== 0 ? (
        <List spacing={4}>
          {links.map((link) => (
            <ListItem key={link.id}>
              <NextLink
                href={link.url}
                className="group flex items-center gap-x-4"
              >
                <ListIcon
                  as={BsGlobe}
                  className="group-hover:text-accent transition-colors"
                />
                <div className="flex flex-col">
                  <Heading
                    as="h4"
                    size="md"
                    className="group-hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Heading>
                  <Text noOfLines={2}>{link.description}</Text>
                </div>
              </NextLink>
            </ListItem>
          ))}
        </List>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Text>
            {" "}
            Nenhuma documentação foi disponíbilizada para esse tópico
          </Text>
          <Text>
            {" "}
            Entre em contato com seu{" "}
            <Highlight
              query="ADMIN"
              styles={{ px: "2", py: "1", rounded: "full", bg: "secondary" }}
            >
              ADMIN
            </Highlight>{" "}
            para adicionar a documentação necessária ou mande uma sugestão
          </Text>
        </div>
      )}
    </>
  );
};

export default LinkList;
