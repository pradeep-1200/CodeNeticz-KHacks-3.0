import React from 'react';

/**
 * AccessibilitySection component to group related toggles with headers.
 */
const AccessibilitySection = ({ title, description, children, badgeText }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
        <div>
          <h4 className="font-extrabold text-xs text-[var(--text-primary)] uppercase tracking-wider">
            {title}
          </h4>
          {description && (
            <p className="text-[11px] text-[var(--text-secondary)]">{description}</p>
          )}
        </div>
        {badgeText && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            {badgeText}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
};

export default AccessibilitySection;
