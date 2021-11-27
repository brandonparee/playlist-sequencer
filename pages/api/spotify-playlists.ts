import { IncomingMessage } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionSpotifyClient } from '../../lib/spotify';

type PaginatedQuery = {
  offset?: number;
  limit?: number;
};

export async function getSpotifyPlaylists(
  req: IncomingMessage,
  query: PaginatedQuery = { limit: 50 }
) {
  const spotifyApi = await getSessionSpotifyClient(req);

  if (!spotifyApi) {
    return null;
  }

  const { offset, limit } = query as PaginatedQuery;

  const {
    body: { items },
  } = await spotifyApi.getUserPlaylists({
    offset,
    limit,
  });

  return items;
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<SpotifyApi.PlaylistObjectSimplified[]>
) => {
  const items = await getSpotifyPlaylists(req, req.query);

  if (!items) {
    return res.status(403).json([]);
  }

  return res.status(200).json(items);
};

export default handler;
