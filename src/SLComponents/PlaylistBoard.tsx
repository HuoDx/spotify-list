import React from 'react';
import Future from '../Future';
import {
    getUserPlaylists,
    getPlaylistTracks,
    IPlaylist,
    IPlaylistTrack
} from '../SpotifyAPI';


export default function PlaylistBoard() {
    return (
        <Future promise={() => getUserPlaylists()}>
            {data =>
                <div>
                    <h2>Playlists</h2>
                    <ul>
                        {data.map((playlist: IPlaylist, i: number) =>
                            <Playlist listKey={i}
                                id={playlist.id}
                                name={playlist.name} />
                        )}
                    </ul>
                </div>
            }
        </Future>
    );
}

function Playlist(props: { id: string, name: string, listKey: number }) {
    return (
        <li key={props.listKey}>
            <PlaylistInsights id={props.id} name={props.name}/>
        </li>
    );
}

function PlaylistInsights(props: { id: string, name: string }) {
    return (
        <Future promise={() => getPlaylistTracks(props.id)}>
            {data =>
                <div>
                    <h3>{props.name} ({data.length} tracks)</h3>
                    <ul>
                        {data.map((track: IPlaylistTrack, i: number) => {
                            return <li key={i}>{track.track.name}</li>
                        })}
                    </ul>

                </div>
            }
        </Future>
    );
}

