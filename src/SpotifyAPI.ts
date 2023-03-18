// first time writing TypeScript...
// I didn't use wheels since the one I can found stopped updating a few years ago.

// this utility script works with such assumptions
// 1. Access Token & Refresh Token exist in LocalStorage
// 2. If AT has expired, RT can be used to renew AT
// 3. If RT doesn't work either, '/connect' can be used to re-connect to Spotify API

// quite a strange way to generate a code verifier
// not mentioned in the SpotifyAPI docs
// I found this in a working example.
// https://github.com/tobika/spotify-auth-PKCE-example/blob/main/public/main.js
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(codeVerifier)
    );
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

/**
 * Generates a Spotify login URL for authentication using PKCE (Proof Key for Code Exchange) flow.
 *
 * @returns {Promise<string>} A promise that resolves to a Spotify login URL string.
 */
export async function
    generateSpotifyLoginURL(): Promise<string> {
    const codeVerifier = `${crypto.randomUUID()}${Date.now()}${crypto.randomUUID()}`;
    console.log(codeVerifier.length);
    localStorage.setItem('code_verifier', codeVerifier);
    const hashedChallenge = await generateCodeChallenge(codeVerifier);
    console.log(hashedChallenge);
    const spotifyURL = new URL('https://accounts.spotify.com/authorize');
    spotifyURL.searchParams.set('client_id', process.env.REACT_APP_CLIENT_ID!);
    spotifyURL.searchParams.set('response_type', 'code');
    spotifyURL.searchParams.set('redirect_uri', process.env.REACT_APP_REDIRECT_URI!);
    spotifyURL.searchParams.set('code_challenge_method', 'S256');
    spotifyURL.searchParams.set('code_challenge', hashedChallenge);
    spotifyURL.searchParams.set(
        'scope',
        [
            'playlist-read-collaborative',
            'playlist-read-private',
            'user-top-read',
            'user-read-private',
            'user-read-email',
        ].join(' ')
    );
    return spotifyURL.toString();
}

interface ISpotifyAuthResponse {
    access_token: string;
    refresh_token: string;
    error?: string;
}

/**
 * Handles the post-authentication process by exchanging the authorization code to get access token and refresh token.
 * for an access token and a refresh token using the Spotify API token endpoint.
 *
 * @param {string} code - The authorization code.
 * @returns {Promise<void>} A promise that resolves when the tokens are successfully obtained and stored.
 * @throws {Error} If there's an error during the token fetching process.
 */
export async function postAuth(code: string): Promise<void> {
    const codeVerifier = localStorage.getItem('code_verifier');
    const requestPayload = new URLSearchParams();
    requestPayload.append('grant_type', 'authorization_code');
    requestPayload.append('code', code);
    requestPayload.append('client_id', process.env.REACT_APP_CLIENT_ID!);
    requestPayload.append('redirect_uri', process.env.REACT_APP_REDIRECT_URI!);
    requestPayload.append('code_verifier', codeVerifier!);
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestPayload,
    });
    const data: ISpotifyAuthResponse = await response.json();
    if (data.error === undefined) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
    } else throw new Error(JSON.stringify(data));
}

/**
 * Refreshes the access token using the refresh token, 
 * and stores the new access token w/ refresh token in localStorage
 */
export async function RefreshAuth(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    const requestPayload = new URLSearchParams();
    requestPayload.append('grant_type', 'refresh_token');
    requestPayload.append('refresh_token', refreshToken!);
    requestPayload.append('client_id', process.env.REACT_APP_CLIENT_ID!);
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestPayload,
    });
    const data: ISpotifyAuthResponse = await response.json();
    if (!data.error) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
    } else {
        // now we must re-connect to Spotify API as the refresh token no longer works
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/connect';
    }
}

async function makeSpotifyRequest<T>
    (url: string, method = 'GET', body = null, retries = 2): Promise<T> {

    while (retries-- > 0) {
        const accessToken = localStorage.getItem('access_token')
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            body
        })
        const data = await response.json()
        console.log(data)
        if (data.error) {
            if (data.error.status === 401) {
                // access token expires, refresh w/ refresh token
                await RefreshAuth()
                continue;
            } else {
                throw new Error(JSON.stringify(data))
            }
        } else return data;
    }
    throw new Error('Failed to make Spotify request');
}

// these are pretty straightforward, especially with all these interfaces.

export interface IUserProfile {
    username: string;
    avatarURL: string;
}

export async function getUserProfile(): Promise<IUserProfile> {
    const profile = await makeSpotifyRequest<{ display_name: string; images: { url: string }[] }>('https://api.spotify.com/v1/me');
    const username = profile.display_name;
    const avatarURL = profile.images.length ? profile.images[0].url : '';
    return { username, avatarURL };
}


export interface ITrack {
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[] };
}

export async function getUserTopTracks(): Promise<ITrack[]> {
    const topTracks = await makeSpotifyRequest<{ items: ITrack[] }>('https://api.spotify.com/v1/me/top/tracks');
    return topTracks.items;
}


export interface IArtist {
    name: string;
    genres: string[];
    images: { url: string }[];
}

export async function getUserTopArtists(): Promise<IArtist[]> {
    const topArtists = await makeSpotifyRequest<{ items: IArtist[] }>('https://api.spotify.com/v1/me/top/artists');
    return topArtists.items;
}


export interface IPlaylist {
    id: string;
    name: string;
    description: string;
    images: { url: string }[];
}

export async function getUserPlaylists(): Promise<IPlaylist[]> {
    const playlists = await makeSpotifyRequest<{ items: IPlaylist[] }>('https://api.spotify.com/v1/me/playlists');
    return playlists.items;
}


export interface IPlaylistTrack {
    track: ITrack;
}

export async function getPlaylistTracks(playlistID: string): Promise<IPlaylistTrack[]> {
    const tracks = await makeSpotifyRequest<{ items: IPlaylistTrack[] }>(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`);
    return tracks.items;
}