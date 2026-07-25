import React from 'react';
import { BookOpen, Building, Layers, Tag, CalendarCheck, ToggleRight } from 'lucide-react';

/**
 * AcademicInfoCard — Section 2: Academic Information
 * Renders in read mode or edit mode depending on `isEditing`.
 */
const AcademicInfoCard = ({ student, classes, form, isEditing, onChange }) => {
  const Field = ({ icon: Icon, label, value, accent }) => (
    <div className="flex items-start gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${accent || 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-[var(--text-primary)] break-words">
          {value || <span className="text-[var(--text-secondary)] italic font-normal">Not provided</span>}
        </p>
      </div>
    </div>
  );

  const inputCls =
    'w-full px-3 py-2.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-[var(--text-secondary)]';

  // Find primary classroom name for read mode
  const primaryClassroom = student?.classroomId
    ? `${student.classroomId.name} (${student.classroomId.subject})`
    : classes?.length > 0
    ? classes.map(c => c.name).join(', ')
    : null;

  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
          <BookOpen size={17} />
        </div>
        <h2 className="font-extrabold text-base text-[var(--text-primary)]">Academic Information</h2>
      </div>

      <div className="p-6">
        {isEditing ? (
          /* ── Edit Mode ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={onChange}
                placeholder="e.g. Computer Science"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Year / Grade
              </label>
              <input
                type="text"
                name="year"
                value={form.year}
                onChange={onChange}
                placeholder="e.g. 2nd Year"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Section
              </label>
              <input
                type="text"
                name="section"
                value={form.section}
                onChange={onChange}
                placeholder="e.g. Section A"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className={inputCls}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Primary Classroom
              </label>
              <select
                name="classroomId"
                value={form.classroomId}
                onChange={onChange}
                className={inputCls}
              >
                <option value="">None selected</option>
                {(classes || []).map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} — {cls.subject}
                  </option>
                ))}
              </select>
            </div>

          </div>
        ) : (
          /* ── Read Mode ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field icon={Building}     label="Department"  value={student?.department} accent="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <Field icon={Layers}         label="Year / Grade" value={student?.year} />
            <Field icon={Tag}            label="Section"     value={student?.section} />
            <Field
              icon={BookOpen}
              label="Classroom"
              value={primaryClassroom}
              accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            />
            <Field
              icon={CalendarCheck}
              label="Joined Date"
              value={
                student?.joinedAt
                  ? new Date(student.joinedAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })
                  : student?.createdAt
                  ? new Date(student.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })
                  : ''
              }
              accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <Field
              icon={ToggleRight}
              label="Student Status"
              value={student?.status}
              accent={
                student?.status === 'Active'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-slate-500/10 text-slate-500'
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicInfoCard;
