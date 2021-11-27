import { IncomingMessage } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionSpotifyClient } from '../../lib/spotify';

export async function getSpotifyPlaylist(
  req: IncomingMessage,
  query: { id?: string } = {}
) {
  const { id } = query;
  if (!id) {
    return null;
  }

  const spotifyApi = await getSessionSpotifyClient(req);

  if (!spotifyApi) {
    return null;
  }

  const { body } = await spotifyApi.getPlaylist(id);

  return body;
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<SpotifyApi.SinglePlaylistResponse | {}>
) => {
  const playlistData = await getSpotifyPlaylist(req, req.query);

  if (!playlistData) {
    return res.status(403).json({});
  }

  return res.status(200).json(playlistData);
};

export default handler;
