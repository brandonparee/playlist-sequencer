import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import shuffle from 'lodash/shuffle';
import prisma from '../../lib/prisma';
import { getSessionSpotifyClient } from '../../lib/spotify';
import { IncomingMessage } from 'http';
import _, { cloneDeep, flatten, remove, trimEnd } from 'lodash';

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
      include: {
        sequences: true,
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

    let shuffledPlaylist = shuffle(trackIds);

    playlist.sequences.forEach(({ uris }) => {
      const tempArray: (string | string[])[] = cloneDeep(shuffledPlaylist);
      const [first, ...rest] = uris;

      remove(tempArray, (value) => {
        if (typeof value === 'string') {
          return rest.includes(value);
        }
      });

      const index = tempArray.indexOf(first);
      if (index) {
        tempArray[index] = uris;
      }
      shuffledPlaylist = flatten(tempArray);
    });

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
    const response = await shufflePlaylist(req, req.body);

    return res.status(200).json(response);
  } else {
    return res.status(400).json({});
  }
}
