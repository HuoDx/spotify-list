// this utility script works with such assumptions
// 1. Access Token & Refresh Token exist in LocalStorage
// 2. If AT has expired, RT can be used to renew AT
// 3. If RT doesn't work either, '/connect' can be used to re-connect to Spotify API


// quite a strange way to generate a code verifier
// not mentioned in the SpotifyAPI docs
// I found this in a working example.
// https://github.com/tobika/spotify-auth-PKCE-example/blob/main/public/main.js
async function _generateCodeChallenge(codeVerifier) {
    const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(codeVerifier),
    );

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

export async function generateSpotifyLoginURL() {
    const codeVerifier = (crypto.randomUUID() + Date.now().toString() + crypto.randomUUID())
    console.log(codeVerifier.length)
    localStorage.setItem('code_verifier', codeVerifier)
    const hashedChallenge = await _generateCodeChallenge(codeVerifier)
    console.log(hashedChallenge)
    const spotifyURL = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
        'client_id': process.env.REACT_APP_CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': process.env.REACT_APP_REDIRECT_URI,
        'code_challenge_method': 'S256',
        'code_challenge': hashedChallenge,
        'scope': [
            'playlist-read-collaborative',
            'playlist-read-private',
            'user-top-read',
            'user-read-private',
            'user-read-email'
        ].join(' ')
    }).toString()
    return spotifyURL
}

export async function postAuth(code) {
    const codeVerifier = localStorage.getItem('code_verifier')
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': process.env.REACT_APP_CLIENT_ID,
            'redirect_uri': process.env.REACT_APP_REDIRECT_URI,
            'code_verifier': codeVerifier
        })
    })
    const data = await response.json()
    if (!data.error) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        Promise.resolve()
    }
    Promise.reject(data.error)
}

export async function RefreshAuth() {
    const refreshToken = localStorage.getItem('refresh_token')
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken,
            'client_id': process.env.REACT_APP_CLIENT_ID,
        })
    })
    const data = await response.json()
    if (!data.error) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
    } else {
        // now we must re-connect to Spotify API as the refresh token no longer works
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/connect'
    }
}

async function makeSpotifyRequest(url, method = 'GET', body = null, retries = 2) {

    while (retries --> 0) {
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
                // other errors we cannot resolve, re-connect to Spotify API
                window.location.href = '/connect'
            }
        } else return data;
    }
}

export async function getUserProfile() {
    let username = '', avatarURL = '';
    const profile = await makeSpotifyRequest('https://api.spotify.com/v1/me')
    username = profile.display_name
    avatarURL = profile.images.length ? profile.images[0].url : '';
    return { username, avatarURL }
}

export async function getUserTopTracks() {
    const topTracks = await makeSpotifyRequest('https://api.spotify.com/v1/me/top/tracks')
    return topTracks.items
}

export async function getUserTopArtists() {
    const topArtists = await makeSpotifyRequest('https://api.spotify.com/v1/me/top/artists')
    return topArtists.items
}

export async function getUserPlaylists() {
    const playlists = await makeSpotifyRequest('https://api.spotify.com/v1/me/playlists')
    console.log(playlists)
    return playlists.items
}

export async function getPlaylistTracks(playlistID) {
    const tracks = await makeSpotifyRequest(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`)
    return tracks.items
}
