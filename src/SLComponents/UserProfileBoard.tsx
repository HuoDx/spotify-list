import React from 'react';
import Future from '../Future';
import { getUserProfile } from '../SpotifyAPI';
import '../css/UserProfileBoard.css'

export default function UserProfileBoard() {
    return (
        <Future promise={() => getUserProfile()}>
            {data =>
                <div className="profile-container">
                    {data.avatarURL !== '' ?
                        <img src={data.avatarURL} width={36} height={36} alt="avatar" /> :
                        <div></div>}
                    <div className="name-box">{data.username}</div>
                </div>
            }
        </Future>
    );
}
