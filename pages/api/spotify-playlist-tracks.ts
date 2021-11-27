import { IncomingMessage } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionSpotifyClient } from '../../lib/spotify';

type PaginatedQuery = {
  offset?: number;
  limit?: number;
};

export async function getSpotifyPlaylistTracks(
  req: IncomingMessage,
  query: PaginatedQuery & { id?: string } = {}
) {
  const { id } = query;
  if (!id) {
    return null;
  }

  const spotifyApi = await getSessionSpotifyClient(req);

  if (!spotifyApi) {
    return null;
  }

  const { offset, limit } = query;

  const { body } = await spotifyApi.getPlaylistTracks(id, { offset, limit });

  return body;
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<SpotifyApi.SinglePlaylistResponse | {}>
) => {
  const playlistData = await getSpotifyPlaylistTracks(req, req.query);

  if (!playlistData) {
    return res.status(403).json({});
  }

  return res.status(200).json(playlistData);
};

export default handler;
