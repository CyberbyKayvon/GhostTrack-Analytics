import React from 'react';

const StatCard = ({ title, value, icon: Icon, gradient }) => {
  return (
    <div className={`${gradient} p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
        {Icon && <Icon className="w-12 h-12 opacity-80" />}
      </div>
    </div>
  );
};

export default StatCard;