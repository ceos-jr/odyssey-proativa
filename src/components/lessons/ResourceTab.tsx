import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { type Video, type Link, type Project } from "@prisma/client";
import LinkList from "./LinkList";
import ProjectList from "./ProjectList";
import VideoList from "./VideoList";

interface LinkListProps {
  videos: Video[];
  links: Link[];
  projects: Project[];
}

const ResourceTab = ({ videos, links, projects }: LinkListProps) => {
  return (
    <Tabs
      colorScheme="twitter"
      variant="soft-rounded"
      bgColor="white"
      rounded="lg"
      p="4"
      className="shadow-lg"
    >
      <TabList>
        <Tab>Videos</Tab>
        <Tab>Docs</Tab>
        <Tab>Projetos</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <VideoList videos={videos} />
        </TabPanel>
        <TabPanel>
          <LinkList links={links} />
        </TabPanel>
        <TabPanel>
          <ProjectList projects={projects} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default ResourceTab;
