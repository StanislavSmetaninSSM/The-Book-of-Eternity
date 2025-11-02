import React from 'react';

interface SectionHeaderProps {
  title: string;
  icon: React.ElementType;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon: Icon }) => {
  return (
    <h4 className="text-lg font-bold text-cyan-300/80 uppercase tracking-wider mb-3 pb-2 border-b-2 border-cyan-500/20 flex items-center gap-2">
      <Icon className="w-5 h-5" />
      {title}
    </h4>
  );
};

export default SectionHeader;
