import React from 'react';
import { Link } from 'react-router-dom';

function HomeNavbar() {
  return (
    <nav className="bg-blue-700 w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-3xl font-bold text-white hover:text-blue-200">SmartCards</Link>
          <div className="flex items-center space-x-4">
            <Link to="/upload" className="text-white hover:text-blue-200 text-lg font-bold">About</Link>
            <button className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-blue-100 transition duration-150 ease-in-out">
              <Link to="/upload" className="text-blue-700 hover:text-blue-900 text-lg font-bold">Log In</Link>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HomeNavbar;