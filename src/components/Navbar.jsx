import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="w-64 h-full bg-blue-700 p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-8 text-center">SmartCards</h1>
      <ul className="space-y-4 flex-grow">
        <li>
          <Link to="/upload" className="block w-full text-white text-lg bg-blue-600 hover:bg-blue-500 rounded-lg py-3 px-4 transition duration-150 ease-in-out">
            Upload
          </Link>
        </li>
        <li>
          <Link to="/items" className="block w-full text-white text-lg bg-blue-600 hover:bg-blue-500 rounded-lg py-3 px-4 transition duration-150 ease-in-out">
            Items
          </Link>
        </li>
        <li>
          <Link to="/insights" className="block w-full text-white text-lg bg-blue-600 hover:bg-blue-500 rounded-lg py-3 px-4 transition duration-150 ease-in-out">
            Insights
          </Link>
        </li>
      </ul>
      <div className="mt-auto">
        <Link to="/" className="block w-full text-blue-700 text-lg bg-white hover:bg-blue-100 rounded-lg py-3 px-4 transition duration-150 ease-in-out">
          Logout
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;