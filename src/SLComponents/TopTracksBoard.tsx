import React from 'react';
import Future from '../Future';
import { getUserTopTracks, ITrack } from '../SpotifyAPI';

export default function TopTracks() {
    return (
        <Future promise={() => getUserTopTracks()}>
            {data =>
                <div>
                    <h2>Top Tracks</h2>
                    {data.length > 0 ? <ul>
                        {data.map((track: ITrack, i: number) => {
                            return <li key={i}>{track.name}</li>
                        })}
                    </ul> :
                        <div>Data is not available; try using Spotify for a longer time :D</div>
                    }
                </div>
            }
        </Future>
    );
}