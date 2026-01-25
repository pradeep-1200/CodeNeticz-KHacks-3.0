import React from 'react';

const InsightCard = ({ icon: Icon, title, description, colorClass = "text-blue-600", bgClass = "bg-blue-50" }) => {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-[var(--border-color)] shadow-sm hover:translate-y-[-2px] transition-transform flex flex-col h-full">
      <div className={`w-12 h-12 ${bgClass} ${colorClass} rounded-lg flex items-center justify-center mb-4`}>
        {Icon && <Icon size={24} />}
      </div>
      <h3 className="font-bold mb-2 text-lg text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">
        {description}
      </p>
    </div>
  );
};

export default InsightCard;
