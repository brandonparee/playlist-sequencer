import { GetServerSidePropsContext } from 'next';
import { Text, Wrap, WrapItem } from '@chakra-ui/layout';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import apiClient from '../../lib/apiClient';
import { getSpotifyPlaylists } from '../api/spotify-playlists';
import { PlaylistCard } from '../../components/PlaylistCard';

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

export default function PlaylistsPage() {
  const { data } = useQuery('spotify-playlists', () =>
    apiClient.getSpotifyPlaylists()
  );

  return (
    <Wrap p={50} w="full" alignItems="center" justify="center" spacing={4}>
      {data?.map((singlePlaylist) => (
        <WrapItem key={singlePlaylist.id}>
          <PlaylistCard playlistData={singlePlaylist} showDescription={false} />
        </WrapItem>
      ))}
    </Wrap>
  );
}

PlaylistsPage.auth = true;
