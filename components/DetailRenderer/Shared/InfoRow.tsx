import React from 'react';

const InfoRow = ({ label, value, icon: Icon, title }: { label: React.ReactNode, value: React.ReactNode, icon?: React.ElementType, title?: string }) => (
    <div className="flex justify-between items-center py-1.5" title={title}>
        <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4" />}
            {label}
        </span>
        <div className="text-right text-sm text-gray-200">{value}</div>
    </div>
);

export default InfoRow;