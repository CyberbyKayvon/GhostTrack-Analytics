import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-00 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/ghostlogotransparent.png"
              alt="GhostTrack"
              className="h-40 w-auto"
              style={{ imageRendering: 'auto' }}
            />
          </div>

          {/* Right side - can add navigation items here later */}
          <div className="flex items-center gap-4">
            {/* Add nav items here if needed */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;