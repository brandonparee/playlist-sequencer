import { Heading, Text, VStack } from '@chakra-ui/layout';
import millisecondsToSeconds from 'date-fns/millisecondsToSeconds';
import { GetServerSidePropsContext } from 'next';
import React, { useMemo } from 'react';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { Column, Cell } from 'react-table';
import { DataTable } from '../../components/DataTable';
import SanitizeHTML from '../../components/SanitizeHtml';
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

  const columns: Column<SpotifyApi.PlaylistTrackObject>[] = useMemo(
    () => [
      {
        Header: 'Title',
        accessor: (item) => item.track.name,
        Cell: ({
          value,
          row: { original },
        }: Cell<SpotifyApi.PlaylistTrackObject> & { value: string }) => {
          return (
            <VStack align="start">
              <Text fontWeight={500}>{value}</Text>
              <Text fontWeight={300}>
                {original.track.artists
                  .map<React.ReactNode>((singleArtist) => (
                    <Text key={singleArtist.id} as="span">
                      {singleArtist.name}
                    </Text>
                  ))
                  .reduce((combined, curr) => [combined, ', ', curr])}
              </Text>
            </VStack>
          );
        },
      },
      {
        Header: 'Album',
        accessor: (item) => item.track.album.name,
      },
      {
        Header: 'Duration',
        accessor: (item) => item.track.duration_ms,
        isNumeric: true,
        Cell: ({
          value,
        }: Cell<SpotifyApi.PlaylistTrackObject> & { value: number }) => {
          const seconds = millisecondsToSeconds(value);
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;

          return `${minutes}:${
            remainingSeconds < 10 ? '0' : ''
          }${remainingSeconds}`;
        },
      },
    ],
    []
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
      <DataTable data={tracks.items} columns={columns} />
    </>
  );
}
