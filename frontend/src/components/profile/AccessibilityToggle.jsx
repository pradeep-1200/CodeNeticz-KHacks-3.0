import React from 'react';

/**
 * AccessibilityToggle component for individual feature switches.
 */
const AccessibilityToggle = ({ id, label, description, checked, disabled, onChange, icon: Icon }) => {
  return (
    <div className={`p-3.5 rounded-xl border transition-all duration-200 ${
      checked
        ? 'bg-blue-500/10 border-blue-500/30 dark:bg-blue-950/30'
        : 'bg-[var(--bg-base)] border-[var(--border-color)]'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              checked ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-[var(--text-secondary)]'
            }`}>
              <Icon size={16} />
            </div>
          )}
          <div className="min-w-0">
            <span className="font-bold text-xs text-[var(--text-primary)] block truncate">{label}</span>
            {description && (
              <span className="text-[10px] text-[var(--text-secondary)] block truncate">{description}</span>
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
          <div className="w-9 h-5 bg-gray-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
        </label>
      </div>
    </div>
  );
};

export default AccessibilityToggle;
