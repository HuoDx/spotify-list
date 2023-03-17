import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ConnectSpotify from './ConnectSpotify'
import Callback from './Callback'
import SpotifyList from './SpotifyList'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<SpotifyList />} />
        <Route path='/connect' element={<ConnectSpotify />} />
        <Route path='/callback' element={<Callback />} />
      </Routes>
    </BrowserRouter>


  </React.StrictMode>
);
