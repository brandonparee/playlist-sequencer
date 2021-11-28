import { Heading } from '@chakra-ui/layout';
import { GetServerSidePropsContext } from 'next';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import SanitizeHTML from '../../components/SanitizeHtml';
import PlaylistTable from '../../components/tables/PlaylistTable';
import apiClient from '../../lib/apiClient';
import { inferSSRProps } from '../../utils/inferSSRProps';
import { getSpotifyPlaylist } from '../api/spotify-playlist';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const {
    query: { id },
  } = context;

  if (!id) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const idString = id.toString();
  const queryClient = new QueryClient();
  const queryString = `spotify-playlist-${idString}`;

  await queryClient.prefetchQuery(queryString, () =>
    getSpotifyPlaylist(context.req, { id: idString })
  );

  const data =
    queryClient.getQueryData<SpotifyApi.SinglePlaylistResponse>(queryString);

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      id: idString,
      dehydratedState: dehydrate(queryClient),
      tracks: data.tracks,
    },
  };
}

export default function SinglePlaylistPage({
  id,
  tracks: initialTracks,
}: inferSSRProps<typeof getServerSideProps>) {
  const { data } = useQuery(`spotify-playlist-${id}`, () =>
    apiClient.getSpotifyPlaylist({ id })
  );
  const { data: tracks } = useQuery(
    `spotify-playlist-${id}-tracks`,
    () => apiClient.getSpotifyPlaylistTracks({ id }),
    { initialData: initialTracks }
  );

  if (!tracks) {
    return 'Loading...';
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <Heading as="h3">{data.name}</Heading>
      {data.description && <SanitizeHTML html={data.description} />}
      <PlaylistTable data={tracks.items} />
    </>
  );
}
