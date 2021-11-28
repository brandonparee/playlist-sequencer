import { Playlist } from '.prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../lib/prisma';
import { getSessionSpotifyClient } from '../../lib/spotify';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Playlist | null>
) {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    const spotifyApi = await getSessionSpotifyClient(req);
    const { id } = req.body;

    if (!session?.user?.email || !id || !spotifyApi) {
      return res.status(403).json(null);
    }

    const {
      body: {
        name,
        description,
        id: clonedFromId,
        tracks: { items },
      },
    } = await spotifyApi.getPlaylist(id);

    const trackIds = items.map((singleTrack) => singleTrack.track.uri);

    const { body: createdPlaylist } = await spotifyApi.createPlaylist(
      `${name} (Sequenced)`,
      {
        description: description ? description : undefined,
        public: false,
      }
    );

    await spotifyApi.addTracksToPlaylist(createdPlaylist.id, trackIds);

    const newPlaylist = await prisma.playlist.create({
      data: {
        clonedFromSpotifyId: clonedFromId,
        spotifyId: createdPlaylist.id,
        user: { connect: { email: session.user?.email } },
      },
    });

    return res.status(200).json(newPlaylist);
  } else {
    return res.status(400).json(null);
  }
}
