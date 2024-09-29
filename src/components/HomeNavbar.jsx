import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logoSmartCards.png';

const HomeNavbar = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google'; 
  }; 

  return (
    <nav className="bg-blue-700 w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img src={logo} alt="SmartCards Logo" className="h-12 mr-2" />
            <Link to="/" className="text-3xl font-bold text-white hover:text-blue-200">SmartCards</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/upload" className="text-white hover:text-blue-200 text-lg font-bold">About</Link>
            <button onClick={handleLogin} className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-blue-100 transition duration-150 ease-in-out">
              <h1 className="text-blue-700 hover:text-blue-900 text-lg font-bold">Log In</h1>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;