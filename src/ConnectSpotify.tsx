import React from 'react';

import { generateSpotifyLoginURL } from './SpotifyAPI';

async function _connect() {
    const spotifyURL = await generateSpotifyLoginURL()
    window.location.href = spotifyURL
}

function ConnectSpotify() {
    return (
        <div>
            <h1>Connect to Spotify</h1>
            <button onClick={() => _connect()}>Get Started!</button>
        </div>
    );
}


export default ConnectSpotify;