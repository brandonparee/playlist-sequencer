import { Text, VStack } from '@chakra-ui/layout';
import millisecondsToSeconds from 'date-fns/millisecondsToSeconds';
import { useMemo } from 'react';
import { Cell, Column } from 'react-table';
import { DataTable, DataTableProps } from '../DataTable';

interface PlaylistTableProps
  extends Omit<DataTableProps<SpotifyApi.PlaylistTrackObject>, 'columns'> {
  // This is very lazy and probably not that great of an idea
  prefixColumns?: Column<SpotifyApi.PlaylistTrackObject>[];
  suffixColumns?: Column<SpotifyApi.PlaylistTrackObject>[];
}

function PlaylistTable({
  data,
  prefixColumns = [],
  suffixColumns = [],
  ...rest
}: PlaylistTableProps) {
  const columns: Column<SpotifyApi.PlaylistTrackObject>[] = useMemo(
    () => [
      ...prefixColumns,
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
      ...suffixColumns,
    ],
    [prefixColumns, suffixColumns]
  );

  return <DataTable data={data} columns={columns} {...rest} />;
}

export default PlaylistTable;
