import { IncomingMessage } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getSession } from 'next-auth/react';

export type SavePlaylistSequenceParams = {
  uris?: string[];
  playlistId?: string;
};

export async function savePlaylistSequence(
  req: IncomingMessage,
  query: SavePlaylistSequenceParams
) {
  const session = await getSession({ req });
  const { uris, playlistId } = query;

  console.log(query);

  if (!uris || !playlistId) {
    return {
      status: 'Error',
      message: 'Missing parameters',
    };
  }

  if (!session?.user?.email) {
    return {
      status: 'Error',
      message: 'Auth Error',
    };
  }

  const data = await prisma.playlistSequence.create({
    data: {
      uris,
      playlistId,
    },
  });

  return {
    status: 'Success',
    data,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const response = await savePlaylistSequence(req, req.body);

      return res.status(200).json(response);
    } catch (e) {
      return res.status(400).json({});
    }
  } else {
    return res.status(400).json({});
  }
}
