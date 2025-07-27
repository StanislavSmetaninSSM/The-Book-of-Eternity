
import React from 'react';

const Section = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
    <div className="mt-6">
        <h4 className="text-lg font-bold text-cyan-300/80 uppercase tracking-wider mb-3 pb-2 border-b-2 border-cyan-500/20 flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {title}
        </h4>
        <div className="space-y-3 text-gray-300">
            {children}
        </div>
    </div>
);

export default Section;
