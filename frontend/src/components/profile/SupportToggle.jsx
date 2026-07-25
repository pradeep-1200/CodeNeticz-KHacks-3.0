import React from 'react';

/**
 * SupportToggle component for Learning Support switches (Reading Support, Writing Support, Number Support).
 */
const SupportToggle = ({ id, label, description, checked, disabled, onChange, icon: Icon, badgeText }) => {
  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${
      checked 
        ? 'bg-indigo-500/10 border-indigo-500/30 dark:bg-indigo-950/30' 
        : 'bg-[var(--bg-base)] border-[var(--border-color)] opacity-90'
    }`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              checked ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-[var(--text-secondary)]'
            }`}>
              <Icon size={18} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[var(--text-primary)]">{label}</span>
              {badgeText && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  {badgeText}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
            )}
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(id, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
        </label>
      </div>
    </div>
  );
};

export default SupportToggle;
