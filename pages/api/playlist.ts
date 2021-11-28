import { Playlist, PlaylistSequence } from '.prisma/client';
import { IncomingMessage } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../lib/prisma';
import { getSessionSpotifyClient } from '../../lib/spotify';

export interface GetUserPlaylistResponse extends Playlist {
  spotifyData: SpotifyApi.SinglePlaylistResponse;
  sequences: PlaylistSequence[];
}

export async function getUserPlaylist(
  req: IncomingMessage,
  query: { id?: string }
) {
  const session = await getSession({ req });
  const spotifyApi = await getSessionSpotifyClient(req);

  const { id } = query;

  if (!session?.user?.email || !spotifyApi) {
    return null;
  }

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

  const { body } = await spotifyApi.getPlaylist(playlist.spotifyId, {
    fields:
      'name,description,images,tracks(items(track(!available_markets))),tracks(items(track(album(!available_markets))))',
  });

  return {
    ...playlist,
    spotifyData: body,
  } as GetUserPlaylistResponse;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetUserPlaylistResponse | null>
) {
  try {
    const response = await getUserPlaylist(req, req.query);

    if (response === null) {
      return res.status(403).json(null);
    }

    return res.status(200).json(response);
  } catch (e) {
    return res.status(400).json(null);
  }
}
