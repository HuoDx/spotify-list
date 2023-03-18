import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, NativeRouter } from 'react-router-dom'
import ConnectSpotify from './ConnectSpotify'
import Callback from './Callback'
import SpotifyList from './SpotifyList'

// this cannot be refactored to a TypeScript
const root = ReactDOM.createRoot(document.getElementById('root'));

// I can't make the router work in production environment, 
// nor am I able to find any documentation on how to do it.
// especially is a package that has several incompatible versions 
// (most discussions are for React Router v5, but v6 is the latest)
// Working on it...
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
      <Route path='/connect' element={<ConnectSpotify />} />
        <Route path='/callback' element={<Callback />} />
        <Route index element={<SpotifyList />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
