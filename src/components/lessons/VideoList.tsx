import {
  Text,
  Highlight,
  List,
  ListItem,
  Heading,
  Button,
} from "@chakra-ui/react";
import { type Video } from "@prisma/client";
import NextImage from "next/image";
import NextLink from "next/link";
import { AiFillYoutube, AiOutlineYoutube } from "react-icons/ai";
import { SiUdemy } from "react-icons/si";

interface VideoListProps {
  videos: Video[];
}

const Thumbnail = ({ url }: { url: string }) => {
  const getyoutubeId = (url: string) => {
    const youtubeExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const youtubeMatch = url.match(youtubeExp);
    if (youtubeMatch && youtubeMatch[2])
      return youtubeMatch && youtubeMatch[2].length === 11
        ? youtubeMatch[2]
        : undefined;
    return undefined;
  };

  const youtubeId = getyoutubeId(url);

  return (
    <div className="relative aspect-video sm:w-60">
      {youtubeId !== undefined ? (
        <NextImage
          src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
          alt="thumbnail"
          fill
          className="rounded-xl object-cover"
        />
      ) : url.includes("udemy.com") ? (
        <SiUdemy className="h-full w-full" />
      ) : (
        <AiFillYoutube className="h-full w-full" />
      )}
    </div>
  );
};

const VideoList = ({ videos }: VideoListProps) => {
  return (
    <>
      {videos.length !== 0 ? (
        <List spacing={3}>
          {videos.map((video) => (
            <ListItem
              key={video.id}
              className="flex gap-x-8 rounded-lg p-4 transition-colors hover:bg-gray-100"
            >
              <Thumbnail url={video.url} />

              <div className="flex w-full flex-col">
                <Heading as="h4" size="md">
                  {video.name}
                </Heading>
                <Text as="i" noOfLines={3}>
                  {video.description}
                </Text>
                <NextLink
                  href={video.url}
                  className="w-32 self-end"
                  target="_blank"
                >
                  <Button
                    leftIcon={<AiOutlineYoutube />}
                    colorScheme="red"
                    variant="solid"
                  >
                    Assitir
                  </Button>
                </NextLink>
              </div>
            </ListItem>
          ))}
        </List>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Text> Nenhum video foi disponibilizado para esse tópico</Text>
          <Text>
            {" "}
            Entre em contato com seu{" "}
            <Highlight
              query="ADMIN"
              styles={{ px: "2", py: "1", rounded: "full", bg: "secondary" }}
            >
              ADMIN
            </Highlight>{" "}
            para adicionar um vídeo ou mande uma sugestão
          </Text>
        </div>
      )}
    </>
  );
};

export default VideoList;
