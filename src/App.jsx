import './App.css';
import React from 'react';
import Chat from './pages/Chat/index.jsx';
import Activity from './pages/Activity/index.jsx'
import { Route, Routes, BrowserRouter } from 'react-router-dom';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="Chats/:id" element={ <Chat/> }/>
        <Route path="Activity/" element={ <Activity/> }/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
