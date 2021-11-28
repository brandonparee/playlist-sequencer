import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import shuffle from 'lodash/shuffle';
import prisma from '../../lib/prisma';
import { getSessionSpotifyClient } from '../../lib/spotify';
import { IncomingMessage } from 'http';

export async function shufflePlaylist(
  req: IncomingMessage,
  query: { id?: string }
) {
  const session = await getSession({ req });
  const spotifyApi = await getSessionSpotifyClient(req);
  const { id } = query;

  if (!id) {
    return {
      status: 'Error',
      message: 'Missing parameters',
    };
  }

  if (!session?.user?.email || !spotifyApi) {
    return {
      status: 'Error',
      message: 'Auth Error',
    };
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

    await spotifyApi.addTracksToPlaylist(playlist.spotifyId, shuffledPlaylist);

    return {
      status: 'Success',
      message: 'Playlist shuffled',
    };
  } catch (e) {
    return {
      status: 'Error',
      message: 'Some error',
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const response = await shufflePlaylist(req, req.query);

    return res.status(200).json(response);
  } else {
    return res.status(400).json({});
  }
}
