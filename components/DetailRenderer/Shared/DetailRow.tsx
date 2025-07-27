
import React from 'react';

const DetailRow = ({ label, value, icon: Icon }: { label: string, value: React.ReactNode, icon?: React.ElementType }) => (
    <div className="flex justify-between items-start py-2 border-b border-gray-700/50">
        <span className="font-semibold text-gray-400 flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {label}
        </span>
        <div className="text-right max-w-[70%]">{value}</div>
    </div>
);

export default DetailRow;
