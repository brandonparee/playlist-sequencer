import { GetServerSidePropsContext } from 'next';
import { Text, Wrap, WrapItem } from '@chakra-ui/layout';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import apiClient from '../../lib/apiClient';
import { getSpotifyPlaylists } from '../api/spotify-playlists';
import { PlaylistCard } from '../../components/PlaylistCard';
import { useCallback, useState } from 'react';
import { Button } from '@chakra-ui/button';
import { useRouter } from 'next/router';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery('spotify-playlists', () =>
    getSpotifyPlaylists(context.req)
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

type PlaylistPageLoadingState = {
  isLoading: boolean;
  playlistId?: string;
};

function NewPlaylistPage() {
  const [loadingState, setLoadingState] = useState<PlaylistPageLoadingState>({
    isLoading: false,
  });
  const { data } = useQuery('spotify-playlists', () =>
    apiClient.getSpotifyPlaylists()
  );
  const router = useRouter();

  const clonePlaylistAndRedirect = useCallback(
    async (playlistId: string) => {
      try {
        setLoadingState({
          isLoading: true,
          playlistId,
        });
        const { id } = await apiClient.cloneSpotifyPlaylist({ id: playlistId });

        router.push(`/playlists/${id}`);
      } catch (e) {
        setLoadingState({
          isLoading: false,
        });
      }
    },
    [router]
  );

  return (
    <Wrap p={50} w="full" alignItems="center" justify="center" spacing={4}>
      {data?.map((singlePlaylist) => (
        <WrapItem key={singlePlaylist.id}>
          <PlaylistCard playlistData={singlePlaylist} showDescription={false}>
            <Button
              colorScheme="green"
              onClick={() => {
                clonePlaylistAndRedirect(singlePlaylist.id);
              }}
              disabled={loadingState.isLoading}
              isLoading={
                loadingState.isLoading &&
                loadingState.playlistId === singlePlaylist.id
              }
            >
              Copy Playlist
            </Button>
          </PlaylistCard>
        </WrapItem>
      ))}
    </Wrap>
  );
}

NewPlaylistPage.auth = true;

export default NewPlaylistPage;
