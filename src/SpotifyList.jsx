import React from 'react';
import { getUserPlaylists, getUserProfile, getUserTopTracks, getPlaylistTracks } from './SpotifyAPI';
import Future from './Future';


function SpotifyList() {
    return (<div>
        <h1>Spotify List</h1>
        <Future promise={getUserProfile()}>
            {data => {
                return (
                    <div>
                        <div>{data.username}</div>
                        {data.avatarURL !== '' ?  <img src={data.avatarURL} width={48} height={48} alt="avatar" /> : <div></div>}
                    </div>
                )
            }}
        </Future>
        <Future promise={getUserTopTracks()}>
            {data => {
                return (
                    <div>
                        <h2>Top Tracks</h2>
                        <ul>
                            {data.map((track, i) => {
                                return <li key={i}>{track.name}</li>
                            })}
                        </ul>
                    </div>
                )
            }
            }
        </Future>
        <Future promise={getUserPlaylists()}>
            {data => {
                return (
                    <div>
                        <h2>Playlists</h2>
                        <ul>
                            {data.map((playlist, i) => <Playlist key={i} id={playlist.id} name={playlist.name} />)}
                        </ul>
                    </div>
                )
            }}
        </Future>

    </div>)
}

function PlaylistInsights(props) {
    return (<Future promise={getPlaylistTracks(props.id)}>
        {data => {
            return (<div>
                <h3>Playlist Insights ({data.length} tracks)</h3>
                <ul>
                    {data.map((track, i) => {
                        return <li key={i}>{track.track.name}</li>
                    })}
                </ul>

            </div>)
        }}
    </Future>)
}

function Playlist(props) {
    let [insights, setInsights] = React.useState(<div></div>)
    return <li key={props.key}>
        <div>{props.name}</div>
        <button onClick={() => setInsights(<PlaylistInsights id={props.id} />)}
        >Show Insights</button>
        {insights}
    </li>
}
export default SpotifyList