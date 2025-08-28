
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
        AI Grooming Stylist
      </h1>
      <p className="text-gray-400 mt-1 text-sm md:text-base">Virtual Hair and Beard Try-On</p>
    </header>
  );
};

export default Header;
