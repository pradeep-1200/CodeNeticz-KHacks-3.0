import React from 'react';
import { Lock } from 'lucide-react';

/**
 * ComingSoonCard — placeholder sidebar card for future ACLC modules.
 * Visually present but non-interactive. Icon, title and description are props.
 */
const ComingSoonCard = ({ icon: Icon, title, description, accentColor = 'indigo' }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/8',
      icon: 'bg-indigo-500/15 text-indigo-500',
      badge: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      border: 'border-indigo-500/20',
    },
    purple: {
      bg: 'bg-purple-500/8',
      icon: 'bg-purple-500/15 text-purple-500',
      badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      border: 'border-purple-500/20',
    },
    emerald: {
      bg: 'bg-emerald-500/8',
      icon: 'bg-emerald-500/15 text-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      border: 'border-emerald-500/20',
    },
    amber: {
      bg: 'bg-amber-500/8',
      icon: 'bg-amber-500/15 text-amber-500',
      badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      border: 'border-amber-500/20',
    },
  };

  const c = colorMap[accentColor] || colorMap.indigo;

  return (
    <div
      className={`${c.bg} rounded-2xl border ${c.border} p-5 opacity-75 cursor-not-allowed select-none`}
      aria-disabled="true"
      title="Coming Soon"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon size={18} />
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${c.badge}`}>
          <Lock size={9} /> Coming Soon
        </span>
      </div>

      <h3 className="font-extrabold text-sm text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
};

export default ComingSoonCard;
