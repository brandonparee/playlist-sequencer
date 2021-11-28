import { Image } from '@chakra-ui/image';
import { Heading, VStack } from '@chakra-ui/layout';
import { GetServerSidePropsContext } from 'next';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import SanitizeHTML from '../../components/SanitizeHtml';
import apiClient from '../../lib/apiClient';
import { inferSSRProps } from '../../utils/inferSSRProps';
import { getUserPlaylist, GetUserPlaylistResponse } from '../api/playlist';

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
  const queryString = `playlist-${idString}`;
  await queryClient.prefetchQuery(queryString, () =>
    getUserPlaylist(context.req, { id: idString })
  );
  const data = queryClient.getQueryData<GetUserPlaylistResponse>(queryString);

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      id: idString,
      queryString,
      dehydratedState: dehydrate(queryClient),
    },
  };
}

function ModifyPlaylistPage({
  id,
  queryString,
}: inferSSRProps<typeof getServerSideProps>) {
  const { data, isLoading } = useQuery(queryString, () =>
    apiClient.getUserPlaylist({ id })
  );

  if (isLoading || !data) {
    return 'Loading...';
  }

  const spotifyData = data.spotifyData;
  const image = spotifyData.images[0]?.url;

  return (
    <VStack spacing={4}>
      {image && (
        <Image w="xs" h="xs" fit="cover" src={image} alt="Playlist Cover" />
      )}
      <Heading>{spotifyData.name}</Heading>
      <Heading as="h3" size="lg">
        Links
      </Heading>
    </VStack>
  );
}

export default ModifyPlaylistPage;
