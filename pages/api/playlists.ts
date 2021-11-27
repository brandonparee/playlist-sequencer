import { Playlist } from '.prisma/client';
import { IncomingMessage } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../lib/prisma';
import { getSessionSpotifyClient } from '../../lib/spotify';

export interface GetUserPlaylistsResponse extends Playlist {
  name: string;
  description: string | null;
  images: SpotifyApi.ImageObject[];
}

export async function getUserPlaylists(req: IncomingMessage) {
  const session = await getSession({ req });
  const spotifyApi = await getSessionSpotifyClient(req);

  if (!session?.user?.email || !spotifyApi) {
    return null;
  }

  const playlists = await prisma.playlist.findMany({
    where: {
      user: {
        email: session.user.email,
      },
    },
  });

  const playlistsWithData = await Promise.all(
    playlists.map(async (playlist) => {
      const { body } = await spotifyApi.getPlaylist(playlist.spotifyId, {
        fields: 'name,description,images',
      });

      return {
        ...playlist,
        ...body,
      } as GetUserPlaylistsResponse;
    })
  );

  return playlistsWithData;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetUserPlaylistsResponse[]>
) {
  const response = await getUserPlaylists(req);

  if (response === null) {
    return res.status(403).json([]);
  }

  return res.status(200).json(response);
}
