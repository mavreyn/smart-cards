import React from 'react';
import ThreeDcard from '../assets/3d-card.png';

const Home = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-8">
        <div className="md:w-1/2 mb-8 ml-12 md:mb-0">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-indigo-900">Budget Smarter, Invest Wiser</h1>
          <p className="text-2xl mb-6 text-indigo-800">Manage your money with ease and style.</p>
          <button onClick={() => window.location.href = '/upload'} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-xl">
            Get Started Now
          </button>
        </div>
        <div className="md:w-1/2 flex items-center justify-center">
          <img
            src={ThreeDcard}
            alt="3D Credit Card"
            className="w-full h-auto object-contain max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl animate-upDown"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;