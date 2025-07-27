
import React from 'react';

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
    <div className="bg-gray-800/60 p-2 rounded-md flex items-center gap-2 text-sm">
      <Icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-semibold text-gray-200">{value}</p>
      </div>
    </div>
);

export default StatItem;
