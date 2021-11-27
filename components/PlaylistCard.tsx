import NextLink from 'next/link';
import { Image } from '@chakra-ui/image';
import { Box, Link } from '@chakra-ui/layout';
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
      {image && <Image w="xs" h="xs" fit="cover" src={image} alt="avatar" />}

      <Box py={5} px={5} textAlign="center">
        <NextLink href={`/playlist/${playlistData.id}`} passHref>
          <Link display="block" fontSize="2xl" fontWeight="bold">
            {playlistData.name}
          </Link>
        </NextLink>
        {showDescription && playlistData.description && (
          <SanitizeHTML html={playlistData.description} />
        )}
        {children}
      </Box>
    </Box>
  );
};
