import type { BoxProps, FlexProps } from "@chakra-ui/react";
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { FiHome, FiMenu, FiBell, FiChevronDown } from "react-icons/fi";
import { FaHardHat, FaUserCircle, FaTasks } from "react-icons/fa";
import { AiOutlineBook } from "react-icons/ai";
import type { IconType } from "react-icons";
import NextLink from "next/link";
import { useSession } from "@utils/useSession";
import NextImage from "next/image";
import { signOut } from "next-auth/react";
import { Roles } from "@utils/constants";
import ChangeRoleFooter from "./ChangeRoleFooter";
import Logo from "../../../public/logo.png";
import LogoExtended from "../../../public/logo_extended.png";
import Image from "next/image";


interface LinkItemProps {
  name: string;
  icon: IconType;
  link: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: "Home", icon: FiHome, link: "" },
  {name: "Atividades", icon: FaTasks, link: "tasks"},
  { name: "Modulos", icon: AiOutlineBook, link: "modules" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;

interface SidebarProps extends BoxProps {
  onClose: () => void;
}
const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { data: session } = useSession();
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Image
          alt="logo extendida proativa"
          height={40}
          width={200}
          src={LogoExtended}
        />
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link, index) => (
        <NextLink key={index} href={`/${link.link}`}>
          <NavItem icon={link.icon} name={link.name} />
        </NextLink>
      ))}
      {session?.user?.role === Roles.Admin && (
        <NextLink href="/admin">
          <NavItem icon={FaHardHat} name="Admin" />
        </NextLink>
      )}
      <ChangeRoleFooter />
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  icon: IconType;
  name: string;
}
const NavItem = ({ icon, name, ...rest }: NavItemProps) => {
  return (
    <Flex
      align="center"
      p="4"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      _hover={{
        bg: "primary",
        color: "white",
      }}
      {...rest}
    >
      {icon && (
        <Icon
          mr="4"
          fontSize="16"
          _groupHover={{
            color: "white",
          }}
          as={icon}
        />
      )}

      {name}
    </Flex>
  );
};

interface MobileProps extends FlexProps {
  onOpen: () => void;
}
const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  const { data: session } = useSession();
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />
      <Image
        alt="logo proativa"
        className="ml-10 inline-flex md:hidden"
        src={Logo}
        height={40}
        width={40}
      />
      <HStack spacing={{ base: "0", md: "6" }}>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="open menu"
          icon={<FiBell />}
        />
        <Flex alignItems={"center"}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
            >
              <HStack>
                <div className="relative h-8 w-8">
                  {session?.user?.image ? (
                    <NextImage
                      src={session.user.image}
                      alt="user avatar"
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="h-full w-full" />
                  )}
                </div>
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{session?.user?.name}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {session?.user?.role}
                  </Text>
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList bg="white" borderColor="gray.300">
              {/* <MenuItem _focus={{ bg: "primary", textColor: "white" }}> */}
              {/*   Profile */}
              {/* </MenuItem> */}
              {/* <MenuItem _focus={{ bg: "primary", textColor: "white" }}> */}
              {/*   Settings */}
              {/* </MenuItem> */}
              {/* <MenuDivider /> */}
              <MenuItem
                _focus={{ bg: "primary", textColor: "white" }}
                onClick={() => signOut()}
              >
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};
