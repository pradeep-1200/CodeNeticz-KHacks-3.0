import React from 'react';
import { User, Mail, Hash, Phone, Calendar, Users } from 'lucide-react';

/**
 * StudentInfoCard — Section 1: Personal Information
 * Renders in read mode or edit mode depending on `isEditing`.
 */
const StudentInfoCard = ({ student, form, isEditing, onChange }) => {
  const Field = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
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
    'w-full px-3 py-2.5 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-[var(--text-secondary)]';

  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
          <User size={17} />
        </div>
        <h2 className="font-extrabold text-base text-[var(--text-primary)]">Student Information</h2>
      </div>

      <div className="p-6">
        {isEditing ? (
          /* ── Edit Mode ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Enter full name"
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNumber"
                value={form.rollNumber}
                onChange={onChange}
                placeholder="e.g. 2024CS001"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={onChange}
                className={inputCls}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={onChange}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="e.g. +91 98765 43210"
                className={inputCls}
              />
            </div>

          </div>
        ) : (
          /* ── Read Mode ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field icon={User}     label="Full Name"   value={student?.name} />
            </div>
            <Field icon={Mail}       label="Email"       value={student?.email} />
            <Field icon={Hash}       label="Roll Number" value={student?.rollNumber} />
            <Field icon={Users}      label="Gender"      value={student?.gender} />
            <Field
              icon={Calendar}
              label="Date of Birth"
              value={
                student?.dateOfBirth
                  ? new Date(student.dateOfBirth).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })
                  : ''
              }
            />
            <Field icon={Phone}      label="Phone"       value={student?.phone} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInfoCard;
