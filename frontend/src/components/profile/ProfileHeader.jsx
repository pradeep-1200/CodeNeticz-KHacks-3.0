import React from 'react';
import { User, CheckCircle, XCircle, Edit3 } from 'lucide-react';

/**
 * ProfileHeader — shows avatar, name, email, role badge and status badge.
 * Receives the student object and an onEdit callback.
 */
const ProfileHeader = ({ student, onEdit, isEditing }) => {
  const initials = student?.name
    ? student.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'ST';

  const isActive = student?.status === 'Active';

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-indigo-400/30 relative overflow-hidden">
      {/* Background blur orb */}
      <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {student?.profileImage ? (
            <img
              src={student.profileImage}
              alt={student.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center shadow-xl">
              <span className="text-2xl md:text-3xl font-black text-white">{initials}</span>
            </div>
          )}

          {/* Status dot */}
          <span
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-md ${
              isActive ? 'bg-emerald-400' : 'bg-slate-400'
            }`}
            title={student?.status}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight truncate">
              {student?.name || 'Student Name'}
            </h1>
            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                isActive
                  ? 'bg-emerald-400/20 text-emerald-100 border-emerald-300/40'
                  : 'bg-slate-400/20 text-slate-200 border-slate-300/40'
              }`}
            >
              {isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
              {student?.status || 'Active'}
            </span>
          </div>

          <p className="text-indigo-100 text-sm font-medium truncate">
            {student?.email || '—'}
          </p>

          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-2.5 py-1 bg-white/15 backdrop-blur-md text-xs font-bold rounded-xl border border-white/20">
              🎓 Student
            </span>
            {student?.department && (
              <span className="px-2.5 py-1 bg-white/15 backdrop-blur-md text-xs font-bold rounded-xl border border-white/20 truncate max-w-[180px]">
                {student.department}
              </span>
            )}
            {student?.rollNumber && (
              <span className="px-2.5 py-1 bg-white/15 backdrop-blur-md text-xs font-bold rounded-xl border border-white/20 font-mono">
                #{student.rollNumber}
              </span>
            )}
          </div>
        </div>

        {/* Edit button */}
        {!isEditing && (
          <button
            onClick={onEdit}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-extrabold rounded-2xl shadow-lg hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all text-sm"
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
