import NextLink from 'next/link';
import { Image } from '@chakra-ui/image';
import { Box, Link, VStack } from '@chakra-ui/layout';
import SanitizeHTML from './SanitizeHtml';
import React from 'react';

type PlaylistData = {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyApi.ImageObject[];
};

type PlaylistCardProps = {
  playlistData: PlaylistData;
  showDescription?: boolean;
};

export const PlaylistCard = ({
  children,
  playlistData,
  showDescription = true,
}: React.PropsWithChildren<PlaylistCardProps>) => {
  const image = playlistData.images[0]?.url;

  return (
    <Box w="xs" shadow="lg" rounded="lg" overflow="hidden">
      {image && (
        <Image w="xs" h="xs" fit="cover" src={image} alt="Playlist Cover" />
      )}

      <VStack py={5} px={5} spacing={4} textAlign="center">
        <NextLink href={`/playlist/${playlistData.id}`} passHref>
          <Link display="block" fontSize="2xl" fontWeight="bold">
            {playlistData.name}
          </Link>
        </NextLink>
        {showDescription && playlistData.description && (
          <SanitizeHTML html={playlistData.description} />
        )}
        {children}
      </VStack>
    </Box>
  );
};
