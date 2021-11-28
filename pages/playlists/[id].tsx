import { Button, ButtonGroup, IconButton } from '@chakra-ui/button';
import { useBoolean } from '@chakra-ui/hooks';
import { AddIcon, CheckIcon } from '@chakra-ui/icons';
import { Image } from '@chakra-ui/image';
import { Code, Divider, Heading, VStack } from '@chakra-ui/layout';
import { find, findIndex } from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { useCallback, useMemo } from 'react';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { Cell, Column } from 'react-table';
import PlaylistTable from '../../components/tables/PlaylistTable';
import apiClient from '../../lib/apiClient';
import { inferSSRProps } from '../../utils/inferSSRProps';
import useStateArray from '../../utils/useStateArray';
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
  const {
    data,
    isLoading,
    refetch: refetchPlaylist,
  } = useQuery(queryString, () => apiClient.getUserPlaylist({ id }));
  const [link, setLink] = useStateArray<SpotifyApi.TrackObjectFull>();
  const [creatingSequence, setCreatingSequence] = useBoolean(false);

  const saveNewSequence = useCallback(async () => {
    if (link.length) {
      const uris = link.map(({ uri }) => uri);

      const { status } = await apiClient.createPlaylistSequence({
        uris,
        playlistId: id,
      });

      if (status == 'Success') {
        setLink.reset();
        setCreatingSequence.off();
        refetchPlaylist();
      }
    }
  }, [id, link, refetchPlaylist, setCreatingSequence, setLink]);

  const tracks = useMemo(() => data?.spotifyData.tracks.items ?? [], [data]);
  const sequences = useMemo(() => data?.sequences ?? [], [data]);

  const sequenceTracks = useMemo(() => {
    const tracksByUri: {
      [uri: string]: SpotifyApi.TrackObjectFull;
    } = {};
    if (!tracks.length) {
      return tracksByUri;
    }

    sequences.forEach(({ uris }) => {
      uris.forEach((singleUri) => {
        const playlistTrack = find(
          tracks,
          ({ track: { uri } }) => uri === singleUri
        );

        if (playlistTrack) {
          tracksByUri[singleUri] = playlistTrack.track;
        }
      });
    });

    return tracksByUri;
  }, [tracks, sequences]);

  console.log(sequenceTracks);

  const prefixColumns: Column<SpotifyApi.PlaylistTrackObject>[] = useMemo(
    () => [
      {
        id: 'actions',
        accessor: (row) => {
          return row.track.uri;
        },
        Cell: ({
          value,
          row: {
            original: { track },
          },
        }: Cell<SpotifyApi.PlaylistTrackObject> & { value: string }) => {
          const added = find(link, ({ uri }) => uri === value);

          return (
            <IconButton
              onClick={() => {
                !added ? setLink.addItem(track) : setLink.removeItem(track);
              }}
              icon={!added ? <AddIcon /> : <CheckIcon />}
              aria-label="Add to sequence"
            />
          );
        },
      },
      {
        Header: 'Pos.',
        accessor: ({ track: { uri } }) => {
          const index = findIndex(link, ({ uri: itemUri }) => itemUri === uri);

          if (index < 0) {
            return;
          }

          return index + 1;
        },
        isNumeric: true,
      },
    ],
    [link, setLink]
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
      <Divider />
      <Heading as="h3" size="lg">
        {!creatingSequence ? 'Sequences' : 'Creating new Sequence'}
      </Heading>
      <ButtonGroup>
        <Button
          colorScheme={!creatingSequence ? 'green' : 'gray'}
          onClick={setCreatingSequence.toggle}
        >
          {!creatingSequence ? 'Create Sequence' : 'Cancel'}
        </Button>
        {creatingSequence && (
          <Button
            colorScheme="green"
            disabled={link.length === 0}
            onClick={saveNewSequence}
          >
            Save
          </Button>
        )}
      </ButtonGroup>
      <Divider />
      {creatingSequence && (
        <PlaylistTable data={tracks} prefixColumns={prefixColumns} />
      )}
      {!creatingSequence && (
        <Code>{JSON.stringify(data.sequences, null, 2)}</Code>
      )}
    </VStack>
  );
}

export default ModifyPlaylistPage;
