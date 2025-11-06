import React, { useState } from 'react';
import { X, Copy, Check, Code, Globe, Link as LinkIcon } from 'lucide-react';
import { generateTrackingSnippet } from '../../utils/siteManager';

const ViewTrackingCodeModal = ({ isOpen, onClose, site }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !site) return null;

  const snippet = generateTrackingSnippet(site.id);

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Code className="text-white" size={24} />
            </div>
            Tracking Code
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Site Preview Card */}
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-start gap-4">
              {/* Website Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm border-2 border-white border-opacity-30">
                  <Globe size={40} className="text-white" />
                </div>
              </div>

              {/* Site Details */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{site.name}</h3>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white text-opacity-90 hover:text-opacity-100 hover:underline flex items-center gap-1"
                  >
                    <LinkIcon size={14} />
                    {site.url}
                  </a>
                </div>

                <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white text-opacity-75">Site ID:</span>
                    <code className="text-sm font-mono font-bold">{site.id}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Snippet */}
          <div className="border-2 border-purple-200 rounded-xl overflow-hidden">
            {/* Header with copy button */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-3 flex items-center justify-between border-b-2 border-purple-200">
              <div className="flex items-center gap-2">
                <Code size={20} className="text-purple-600" />
                <label className="text-base font-bold text-gray-900">Your Tracking Code</label>
              </div>
              <button
                onClick={handleCopySnippet}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
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

            {/* Code block */}
            <div className="bg-gray-900 p-5 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
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

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTrackingCodeModal;
