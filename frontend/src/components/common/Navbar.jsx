import React, { useState } from 'react';
import { Globe, Plus, ChevronDown, Trash2 } from 'lucide-react';
import { deleteSite } from '../../utils/siteManager';

const Navbar = ({ currentSiteId, onSiteChange, sites, siteStatuses = {}, onAddSite, onSiteDeleted }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentSite = sites.find(site => site.id === currentSiteId);

  const getStatusIndicator = (siteId) => {
    const status = siteStatuses[siteId];
    if (status === 'active') {
      return <span className="w-2 h-2 bg-green-400 rounded-full"></span>;
    } else if (status === 'waiting') {
      return <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>;
    }
    return <span className="w-2 h-2 bg-gray-300 rounded-full"></span>;
  };

  const handleSiteSelect = (siteId) => {
    onSiteChange(siteId);
    setIsDropdownOpen(false);
  };

  const handleDeleteClick = (e, siteId) => {
    e.stopPropagation(); // Prevent triggering site selection

    // Show confirmation popup
    const site = sites.find(s => s.id === siteId);
    if (window.confirm(`⚠️ Delete "${site?.name}"?\n\nThis will permanently remove this site from your dashboard.\n\nThis action cannot be undone.`)) {
      handleDeleteConfirm(e, siteId);
    }
  };

  const handleDeleteConfirm = (e, siteId) => {
    if (e) e.stopPropagation();
    try {
      deleteSite(siteId);
      onSiteDeleted(siteId);
    } catch (error) {
      alert(`❌ Error deleting site: ${error.message}`);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-28 py-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-5">
            <img
              src="/ghostlogotransparent.png"
              alt="GhostTrack"
              className="h-24 w-auto"
              style={{ imageRendering: 'auto' }}
            />
            <div className="border-l-2 border-gray-400 pl-5 hidden md:block">
              <p className="text-xl font-bold text-gray-800 tracking-wide">
                Security-First Web Analytics
              </p>
            </div>
          </div>

          {/* Site Selector & Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Custom Dropdown (Slide Left) */}
            <div className="relative mr-2">
              {/* Current Site Button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg px-4 py-3 shadow-md hover:shadow-lg transition-all hover:from-purple-600 hover:to-blue-600"
              >
                <Globe className="text-white" size={20} />
                <span className="text-white font-semibold text-base">
                  {currentSite?.name || 'Select Site'}
                </span>
                <ChevronDown
                  className={`text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  size={16}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  {/* Dropdown Panel */}
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden z-20">
                    <div className="p-2">
                      {sites.map((site) => (
                        <div key={site.id} className="relative">
                          {/* Site Button */}
                            <div
                              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all mb-1 ${
                                site.id === currentSiteId
                                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                                  : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 text-gray-700 hover:text-gray-900'
                              }`}
                            >
                              <button
                                onClick={() => handleSiteSelect(site.id)}
                                className="flex items-center gap-3 flex-1"
                              >
                                <Globe size={18} className={site.id === currentSiteId ? 'text-white' : 'text-purple-500'} />
                                <span className="font-semibold text-sm">{site.name}</span>
                              </button>

                              <div className="flex items-center gap-2">
                                {getStatusIndicator(site.id)}

                                {/* Delete Button - Only show if more than 1 site */}
                                {sites.length > 1 && (
                                  <button
                                    onClick={(e) => handleDeleteClick(e, site.id)}
                                    className={`p-1.5 rounded hover:bg-red-500 hover:bg-opacity-20 transition-colors ${
                                      site.id === currentSiteId ? 'text-white' : 'text-red-500'
                                    }`}
                                    title="Delete site"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-gray-200"></div>

                    {/* Add Site Button in Dropdown */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onAddSite();
                      }}
                      className="w-full flex items-center gap-3 px-6 py-3 text-purple-600 hover:bg-purple-50 transition-colors font-semibold"
                    >
                      <Plus size={18} />
                      <span className="text-sm">Add New Site</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Add Site Button */}
            <button
              onClick={onAddSite}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg px-4 py-3 shadow-md hover:shadow-lg transition-all hover:from-green-600 hover:to-emerald-600"
              title="Add New Site"
            >
              <Plus className="text-white" size={20} />
              <span className="text-white font-semibold text-sm">Add Site</span>
            </button>

            {/* Remove This Site Button - Only show if more than 1 site */}
            {sites.length > 1 && (
              <button
                onClick={() => {
                  if (window.confirm(`⚠️ Delete "${currentSite?.name}"?\n\nThis will permanently remove this site from your dashboard.\n\nThis action cannot be undone.`)) {
                    handleDeleteConfirm(null, currentSiteId);
                  }
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg px-4 py-3 shadow-md hover:shadow-lg transition-all hover:from-red-600 hover:to-red-700"
                title="Remove Current Site"
              >
                <Trash2 className="text-white" size={20} />
                <span className="text-white font-semibold text-sm">Remove Site</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
