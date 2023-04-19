import { Text, Highlight, List, ListItem, Heading } from "@chakra-ui/react";
import DisplayMarkdown from "@components/Layout/DisplayMarkdown";
import { type Project } from "@prisma/client";

interface VideoListProps {
  projects: Project[];
}

const ProjectList = ({ projects }: VideoListProps) => {
  return (
    <>
      {projects.length !== 0 ? (
        <List spacing={3}>
          {projects.map((project) => (
            <ListItem
              key={project.id}
              className="flex gap-x-8 rounded-lg p-4 transition-colors"
            >
              <div className="flex w-full flex-col">
                <Heading as="h3" size="xl">
                  {project.name}
                </Heading>
                <DisplayMarkdown text={project.richText} />
              </div>
            </ListItem>
          ))}
        </List>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Text> Nenhum projeto foi disponibilizado para esse tópico</Text>
          <Text>
            {" "}
            Entre em contato com seu{" "}
            <Highlight
              query="ADMIN"
              styles={{ px: "2", py: "1", rounded: "full", bg: "secondary" }}
            >
              ADMIN
            </Highlight>{" "}
            para adicionar um projeto ou mande uma sugestão
          </Text>
        </div>
      )}
    </>
  );
};

export default ProjectList;
