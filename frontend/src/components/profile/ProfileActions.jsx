import React from 'react';
import { Save, X, ArrowLeft, Loader2 } from 'lucide-react';

/**
 * ProfileActions — action buttons bar shown at the bottom.
 * In edit mode: Save Changes + Cancel.
 * In view mode: Back to Classroom.
 */
const ProfileActions = ({ isEditing, isSaving, onSave, onCancel, onBack }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] shadow-sm px-6 py-4">

      {/* Left: Back button (always visible) */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] px-4 py-2 rounded-xl transition-all border border-transparent hover:border-[var(--border-color)]"
      >
        <ArrowLeft size={17} />
        Back to Classroom
      </button>

      {/* Right: context-aware actions */}
      {isEditing ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-extrabold text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-[var(--border-color)] hover:border-red-500/30 disabled:opacity-50"
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileActions;
