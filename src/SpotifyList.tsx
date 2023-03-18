import React from 'react';
import UserProfileBoard from './SLComponents/UserProfileBoard';
import TopTracks from './SLComponents/TopTracksBoard';
import PlaylistBoard from './SLComponents/PlaylistBoard';


function SpotifyList() {
    return (
        <div className="container">
            <header>
                <h1>Spotify List</h1>
                <UserProfileBoard />
            </header>
            <div>
                <TopTracks/>
                <PlaylistBoard />
            </div>
        </div>
    );
}

export default SpotifyList;