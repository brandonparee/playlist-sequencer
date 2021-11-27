import { Wrap, WrapItem } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/react';
import Link from 'next/link';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useCallback } from 'react';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { PlaylistCard } from '../../components/PlaylistCard';
import apiClient from '../../lib/apiClient';
import { getUserPlaylists } from '../api/playlists';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery('playlists', () =>
    getUserPlaylists(context.req)
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

function PlaylistsPage() {
  const { data, refetch } = useQuery('playlists', () =>
    apiClient.getUserPlaylists()
  );

  const shufflePlaylist = useCallback(
    async (id: string) => {
      await apiClient.shuffleUserPlaylist({ id });
      refetch();
    },
    [refetch]
  );

  if (!data) {
    return 'Loading...';
  }

  // if (typeof window !== 'undefined') {
  //   window.apiClient = apiClient;
  // }

  return (
    <Wrap p={50} w="full" alignItems="center" justify="center" spacing={4}>
      <Link href="/playlists/new" passHref>
        <WrapItem
          as="a"
          borderStyle="dashed"
          borderColor="gray.400"
          borderWidth={3}
          w="xs"
          minH="xs"
          rounded="lg"
          _hover={{
            shadow: 'lg',
            cursor: 'pointer',
          }}
        >
          Create new
        </WrapItem>
      </Link>
      {data.map((singlePlaylist) => (
        <WrapItem key={singlePlaylist.id}>
          <PlaylistCard playlistData={singlePlaylist} showDescription={false}>
            <Button
              onClick={() => shufflePlaylist(singlePlaylist.id)}
              colorScheme="green"
            >
              Shuffle
            </Button>
          </PlaylistCard>
        </WrapItem>
      ))}
    </Wrap>
  );
}

PlaylistsPage.auth = true;

export default PlaylistsPage;
