import fetch from 'isomorphic-unfetch';
import qs from 'qs';
import { Playlist } from '.prisma/client';
import { GetUserPlaylistResponse } from '../pages/api/playlist';
import { GetUserPlaylistsResponse } from '../pages/api/playlists';
import {
  savePlaylistSequence,
  SavePlaylistSequenceParams,
} from '../pages/api/playlist-sequence';

type IdQuery = {
  id: string;
};

type OffsetLimitPaginationQuery = {
  offset?: number;
  limit?: number;
};

export class ApiClient {
  constructor(public basePath: string = 'http://localhost:3000/api/') {}

  request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = new URL(`${this.basePath}${endpoint}`);
    const headers = {
      'Content-type': 'application/json',
    };
    const config = {
      ...options,
      headers,
    };
    return fetch(url.toString(), config).then((r) => {
      if (r.ok) {
        return r.json();
      }
      throw new Error(r.statusText);
    });
  }

  getSpotifyPlaylists(options: OffsetLimitPaginationQuery = { limit: 50 }) {
    return this.request<SpotifyApi.PlaylistObjectSimplified[]>(
      `spotify-playlists?${qs.stringify(options)}`
    );
  }

  getSpotifyPlaylist({ id }: IdQuery) {
    return this.request<SpotifyApi.SinglePlaylistResponse>(
      `spotify-playlist?${qs.stringify({ id })}`
    );
  }

  getSpotifyPlaylistTracks(options: IdQuery & OffsetLimitPaginationQuery) {
    return this.request<SpotifyApi.PlaylistTrackResponse>(
      `spotify-playlist-tracks?${qs.stringify(options)}`
    );
  }

  cloneSpotifyPlaylist(options: IdQuery) {
    return this.request<Playlist>('clone-playlist', {
      body: JSON.stringify(options),
      method: 'POST',
    });
  }

  getUserPlaylists() {
    return this.request<GetUserPlaylistsResponse[]>('playlists');
  }

  getUserPlaylist(options: IdQuery) {
    return this.request<GetUserPlaylistResponse>(
      `playlist?${qs.stringify(options)}`
    );
  }

  createPlaylistSequence(options: SavePlaylistSequenceParams) {
    console.log(options);
    return this.request<ReturnType<typeof savePlaylistSequence>>(
      'playlist-sequence',
      {
        method: 'POST',
        body: JSON.stringify(options),
      }
    );
  }

  shuffleUserPlaylist(options: IdQuery) {
    return this.request('shuffle-playlist', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }
}

export default new ApiClient();
