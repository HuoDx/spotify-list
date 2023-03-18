import React from 'react';
import UserProfileBoard from './SLComponents/UserProfileBoard';
import TopTracks from './SLComponents/TopTracksBoard';
import PlaylistBoard from './SLComponents/PlaylistBoard';


function SpotifyList() {
    return (
        <div>
            <h1>Spotify List</h1>
            <UserProfileBoard />
            <TopTracks />
            <PlaylistBoard />
        </div>
    );
}

export default SpotifyList;