import React from 'react';
import { Activity } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg mb-8">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-ghost-purple" />
            <h1 className="text-2xl font-bold text-gray-800">
              👻 GhostTrack Analytics
            </h1>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 text-ghost-purple hover:bg-purple-50 rounded-lg transition">
              Dashboard
            </button>
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
              Security
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;