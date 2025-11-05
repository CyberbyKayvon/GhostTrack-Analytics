import React, { useState } from 'react';
import { X, Copy, Check, Code, Globe, Link as LinkIcon } from 'lucide-react';
import { addSite, generateTrackingSnippet } from '../../utils/siteManager';

const AddSiteModal = ({ isOpen, onClose, onSiteAdded }) => {
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Input form, 2: Show snippet
  const [newSite, setNewSite] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!siteName.trim()) {
      setError('Please enter a site name');
      return;
    }

    if (!siteUrl.trim()) {
      setError('Please enter a site URL');
      return;
    }

    try {
      const site = addSite(siteName.trim(), siteUrl.trim());
      setNewSite(site);
      setStep(2);
      onSiteAdded(site);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopySnippet = () => {
    if (!newSite) return;

    const snippet = generateTrackingSnippet(newSite.id);
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSiteName('');
    setSiteUrl('');
    setError('');
    setStep(1);
    setNewSite(null);
    setCopied(false);
    onClose();
  };

  const snippet = newSite ? generateTrackingSnippet(newSite.id) : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {step === 1 ? (
              <>
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                  <Globe className="text-white" size={24} />
                </div>
                Add New Site
              </>
            ) : (
              <>
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <Code className="text-white" size={24} />
                </div>
                Install Tracking Code
              </>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            /* Step 1: Input Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Site Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Name
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="My Awesome Website"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">This will be displayed in your dashboard</p>
              </div>

              {/* Site URL Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="example.com or https://example.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">The domain where you'll install the tracker</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 animate-pulse">
                  <p className="text-base text-red-800 font-bold">❌ {error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
              >
                Generate Tracking Code
              </button>
            </form>
          ) : (
            /* Step 2: Show Snippet */
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  Site added successfully! Copy the tracking code below and paste it into your website's HTML.
                </p>
              </div>

              {/* Site Info */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Site Name:</span>
                    <span className="text-sm font-bold text-gray-900">{newSite?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">Site ID:</span>
                    <span className="text-sm font-mono font-bold text-purple-700">{newSite?.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">URL:</span>
                    <span className="text-sm text-gray-900">{newSite?.url}</span>
                  </div>
                </div>
              </div>

              {/* Tracking Snippet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Tracking Code</label>
                  <button
                    onClick={handleCopySnippet}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
                    {snippet}
                  </pre>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">Installation Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Copy the tracking code above</li>
                  <li>Paste it into your website's HTML, just before the closing &lt;/head&gt; tag</li>
                  <li>Save and deploy your website</li>
                  <li>Visit your site to test - data should appear within seconds!</li>
                </ol>
              </div>

              {/* Done Button */}
              <button
                onClick={handleClose}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSiteModal;
