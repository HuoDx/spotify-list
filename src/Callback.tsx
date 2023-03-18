import React from 'react';
import { postAuth } from './SpotifyAPI'
import Future from './Future'

export default function Callback() {
    const error = new URLSearchParams(window.location.search).get('error')
    const code = new URLSearchParams(window.location.search).get('code')

    return error ?
        <h1>Error: {error}</h1> :
        <Future promise={() => postAuth(code!)}
            rejected={(err: string) => <div></div>}
            loading={<h1>Connecting to Spotify...</h1>}>
            {(data) => {
                window.location.href = '/'
                return (<div>Success!</div>)
            }}
        </Future>
}