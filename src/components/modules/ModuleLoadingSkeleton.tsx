import { Skeleton, GridItem, SkeletonText } from "@chakra-ui/react";
export const ModuleLoadingSke = () => {
  return (
    <GridItem
      as="article"
      maxW="sm"
      p="5"
      borderWidth="1px"
      rounded="md"
      bg="white"
      w="100%"
    >
      <SkeletonText mb="4" noOfLines={1} w="20" spacing="4" />
      <Skeleton mb="10" noOfLines={1} height="8" />
      <SkeletonText mt="4" noOfLines={2} spacing="4" />
    </GridItem>
  );
};

export default ModuleLoadingSke;
