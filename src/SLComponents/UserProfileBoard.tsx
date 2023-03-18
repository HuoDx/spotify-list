import React from 'react';
import Future from '../Future';

import { getUserProfile } from '../SpotifyAPI';

export default function UserProfileBoard() {
    return (
        <Future promise={() => getUserProfile()}>
            {data =>
                <div>
                    <div>{data.username}</div>
                    {data.avatarURL !== '' ?
                        <img src={data.avatarURL} width={48} height={48} alt="avatar" /> :
                        <div></div>}
                </div>
            }
        </Future>
    );
}
