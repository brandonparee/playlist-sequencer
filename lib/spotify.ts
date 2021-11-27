import prisma from './prisma';
import isEmpty from 'lodash/isEmpty';
import { getSession } from 'next-auth/react';
import SpotifyWebApi from 'spotify-web-api-node';
import { IncomingMessage } from 'http';

export async function getSessionSpotifyClient(req: IncomingMessage) {
  const session = await getSession({ req });

  if (!session?.user?.email || isEmpty(session)) {
    return null;
  }

  const account = await prisma.account.findFirst({
    where: {
      user: {
        email: session.user?.email,
      },
    },
  });

  const refreshToken = account?.refresh_token;

  if (refreshToken) {
    const spotifyApi = await getAuthenticatedSpotifyApiClient(refreshToken);

    if (spotifyApi) {
      return spotifyApi;
    }
  }
}

export async function getAuthenticatedSpotifyApiClient(refreshToken: string) {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    refreshToken,
  });

  try {
    const {
      body: { access_token },
    } = await spotifyApi.refreshAccessToken();

    if (access_token) {
      spotifyApi.setAccessToken(access_token);
    }
  } catch (e) {
    console.log(e);

    return null;
  }

  return spotifyApi;
}
