import React from 'react';
import { Shield, CheckCircle, Activity } from 'lucide-react';

const SecurityAlerts = ({ alerts, botCount }) => {
  const hasThreats = alerts && alerts.length > 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-[300px] flex flex-col overflow-hidden">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
        <span className="flex items-center">
          <Shield className="w-6 h-6 mr-2 text-blue-500" />
          Security Alerts
        </span>
        {!hasThreats && (
          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
            Secure
          </span>
        )}
      </h3>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {!hasThreats ? (
          <div className="text-center w-full px-4">
            <div className="flex justify-center mb-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <p className="text-base font-semibold text-gray-800 mb-1">All clear! No threats detected.</p>
            <p className="text-xs text-gray-500 mb-4">Your site is secure and protected.</p>

            {/* Stats Row - Constrained */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-700">0</div>
                <div className="text-xs text-green-600 font-medium">Bots Blocked</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center mb-1">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-blue-700">100%</div>
                <div className="text-xs text-blue-600 font-medium">Uptime</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <div className="space-y-3 overflow-y-auto max-h-48">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-500 p-2 rounded-full">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-800">{alert.type}</p>
                        <p className="text-sm text-red-600">{alert.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-red-500 font-medium">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityAlerts;