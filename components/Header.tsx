import { ReactNode } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
} from '@chakra-ui/react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { HamburgerIcon, CloseIcon, AddIcon } from '@chakra-ui/icons';
import { signOut, useSession } from 'next-auth/react';

const Links = [
  {
    label: 'Sequenced Playlists',
    href: '/playlists',
  },
  {
    label: 'Spotify Playlists',
    href: '/playlists/new',
  },
];

const NavLink = ({ href, children }: { children: ReactNode; href: string }) => (
  <NextLink href={href} passHref>
    <Link
      px={2}
      py={1}
      rounded="md"
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
    >
      {children}
    </Link>
  </NextLink>
);

export default function Header() {
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { toggleColorMode } = useColorMode();
  const ThemeIcon = useColorModeValue(FaMoon, FaSun);

  const isLoggedIn = !!session?.user;

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4} mb={4}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems="center">
            <Box>Playlist Sequencer</Box>
            <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }}>
              {Links.map(({ label, href }) => (
                <NavLink key={label} href={href}>
                  {label}
                </NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems="center">
            {isLoggedIn && (
              <NextLink href="/playlists/new" passHref>
                <Button
                  as="a"
                  variant="solid"
                  colorScheme="green"
                  size="sm"
                  mr={4}
                  leftIcon={<AddIcon />}
                >
                  New Playlist
                </Button>
              </NextLink>
            )}
            <IconButton
              mr={4}
              size="sm"
              icon={<ThemeIcon />}
              aria-label="Toggle theme"
              onClick={toggleColorMode}
            />
            {isLoggedIn && (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded="full"
                  variant="link"
                  cursor="pointer"
                  minW={0}
                >
                  <Avatar
                    size="sm"
                    src={session.user?.image ?? undefined}
                    name={session.user?.name ?? undefined}
                  />
                </MenuButton>
                <MenuList>
                  {/* <MenuDivider /> */}
                  <MenuItem onClick={() => signOut()}>Sign Out</MenuItem>
                </MenuList>
              </Menu>
            )}
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as="nav" spacing={4}>
              {Links.map(({ label, href }) => (
                <NavLink key={label} href={href}>
                  {label}
                </NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
