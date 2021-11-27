import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import shuffle from 'lodash/shuffle';
import prisma from '../../lib/prisma';
import { getSessionSpotifyClient } from '../../lib/spotify';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    const spotifyApi = await getSessionSpotifyClient(req);
    const { id } = req.body;

    if (!session?.user?.email || !id || !spotifyApi) {
      return res.status(403).json({});
    }

    try {
      const playlist = await prisma.playlist.findFirst({
        where: {
          id,
          user: {
            email: session.user.email,
          },
        },
        rejectOnNotFound: true,
      });

      const {
        body: { items },
      } = await spotifyApi.getPlaylistTracks(playlist.spotifyId);

      const trackIds = items.map((singleTrack) => singleTrack.track.uri);
      const trackUriObjects = trackIds.map((trackId) => ({ uri: trackId }));

      await spotifyApi.removeTracksFromPlaylist(
        playlist.spotifyId,
        trackUriObjects
      );

      const shuffledPlaylist = shuffle(trackIds);

      await spotifyApi.addTracksToPlaylist(
        playlist.spotifyId,
        shuffledPlaylist
      );

      return res.status(200).json({
        status: 'Success',
        message: 'Tracks shuffled',
      });
    } catch (e) {
      return res.status(400).json({});
    }
  } else {
    return res.status(400).json({});
  }
}
