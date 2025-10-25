import React from 'react';
import { AlertTriangle, Shield } from 'lucide-react';

const SecurityAlerts = ({ alerts }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-6 h-6 text-red-500" />
        <h3 className="text-xl font-bold text-gray-800">🤖 Security Alerts</h3>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p>All clear! No threats detected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-red-800">{alert.type}</p>
                <p className="text-sm text-red-600">{alert.details}</p>
                <span className="text-xs text-red-400">
                  {new Date(alert.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SecurityAlerts;