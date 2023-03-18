import React from 'react';
import './css/ConnectSpotify.css';
import { generateSpotifyLoginURL } from './SpotifyAPI';

async function _connect() {
    const spotifyURL = await generateSpotifyLoginURL()
    window.location.href = spotifyURL
}

function ConnectSpotify() {
    return (
        <div className="center">
            <h1>Spotify List</h1>
            <button onClick={() => _connect()}>Get Started!</button>
        </div>
    );
}


export default ConnectSpotify;