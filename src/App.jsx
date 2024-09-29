import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from './pages/Home';
import Upload from './pages/Upload';
import Items from './pages/Items';
import Insights from './pages/Insights';
import Navbar from './components/Navbar';
import HomeNavbar from './components/HomeNavbar';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div>
      {isHomePage ? (
        <div className="bg-gradient-to-b from-blue-50 to-blue-200 min-h-screen overflow-hidden">
          <HomeNavbar />
          <Home/>
        </div>
      ) : (
        <div className="flex w-full h-screen bg-blue-100">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route exact path="/upload" Component={Upload} />
              <Route exact path="/items" Component={Items} />
              <Route exact path="/insights" Component={Insights} />
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
