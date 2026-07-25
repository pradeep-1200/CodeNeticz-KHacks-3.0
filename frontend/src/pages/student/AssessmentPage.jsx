import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getStudentAssessments } from '../../services/api';
import {
   ClipboardCheck, Clock, Calendar, User, BookOpen, Hash, Eye,
   Play, AlertCircle, CheckCircle2, Loader2, Filter
} from 'lucide-react';

/* ── Reusable Assessment Card Component ─────────────────────── */
const AssessmentCard = ({ assessment, onViewDetails }) => {
   const statusConfig = {
      'Upcoming':  { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',       dot: 'bg-blue-500' },
      'Active':    { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse', dot: 'bg-emerald-500' },
      'Completed': { color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',   dot: 'bg-purple-500' },
      'Missed':    { color: 'bg-red-500/10 text-red-600 border-red-500/20',            dot: 'bg-red-500' },
   };

   const status = statusConfig[assessment.status] || statusConfig['Upcoming'];
   const formattedDate = assessment.scheduledDate
      ? new Date(assessment.scheduledDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
      : 'N/A';
   const teacherName = assessment.teacherId?.name || (typeof assessment.teacherId === 'string' ? assessment.teacherId : 'Faculty');
   const questionCount = (assessment.questions || []).length || (assessment.question ? 1 : 0);
   const subject = assessment.subject || assessment.classId?.subject || 'Assessment';

   return (
      <div className="bg-[var(--bg-surface)] p-6 rounded-3xl shadow-sm border border-[var(--border-color)] hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-5 card-hover-lift">
         <div className="space-y-3">
            {/* Subject + Status */}
            <div className="flex justify-between items-start">
               <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  {subject}
               </span>
               <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${status.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {assessment.status}
               </span>
            </div>

            {/* Title + Classroom */}
            <div>
               <h3 className="font-black text-xl text-[var(--text-primary)] tracking-tight leading-snug">{assessment.title}</h3>
               <p className="text-xs text-[var(--text-secondary)] font-semibold mt-1 flex items-center gap-1.5">
                  <BookOpen size={12} className="text-indigo-500" />
                  <span>{assessment.classId?.name || 'Enrolled Class'}</span>
               </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 pt-3 text-xs font-semibold border-t border-[var(--border-color)]">
               <div className="space-y-1">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block flex items-center gap-1"><User size={10} /> Teacher</span>
                  <span className="text-[var(--text-primary)] font-bold truncate block">{teacherName}</span>
               </div>
               <div className="space-y-1">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block flex items-center gap-1"><Hash size={10} /> Questions</span>
                  <span className="text-[var(--text-primary)] font-bold block">{questionCount} {questionCount === 1 ? 'Question' : 'Questions'}</span>
               </div>
               <div className="space-y-1">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block flex items-center gap-1"><Clock size={10} /> Duration</span>
                  <span className="text-[var(--text-primary)] font-bold block">{assessment.duration || 30} mins</span>
               </div>
               <div className="space-y-1">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block flex items-center gap-1"><Calendar size={10} /> Scheduled</span>
                  <span className="text-[var(--text-primary)] font-bold block">{formattedDate}</span>
               </div>
               <div className="col-span-2 space-y-1">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block flex items-center gap-1"><Clock size={10} /> Time Slot</span>
                  <span className="text-[var(--text-primary)] font-bold block">{assessment.startTime || '—'} – {assessment.endTime || '—'}</span>
               </div>
            </div>
         </div>

         {/* Action */}
         <button
            onClick={() => onViewDetails(assessment._id)}
            className="w-full py-3 bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-indigo-500/10 hover:text-indigo-600 hover:border-indigo-500/30 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
         >
            <Eye size={14} /> View Details
         </button>
      </div>
   );
};

/* ── Section Component ──────────────────────────────────────── */
const AssessmentSection = ({ title, icon: Icon, iconColor, assessments, emptyMessage, onViewDetails }) => (
   <div className="space-y-4">
      <div className="flex items-center justify-between">
         <h2 className="text-lg font-extrabold flex items-center gap-2 tracking-tight">
            <Icon size={20} className={iconColor} /> {title}
         </h2>
         <span className="text-xs font-extrabold text-[var(--text-secondary)] bg-[var(--bg-base)] px-3 py-1 rounded-full border border-[var(--border-color)]">
            {assessments.length} {assessments.length === 1 ? 'assessment' : 'assessments'}
         </span>
      </div>

      {assessments.length === 0 ? (
         <div className="p-8 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] space-y-2">
            <Icon size={32} className="mx-auto text-[var(--text-secondary)] opacity-30" />
            <p className="text-sm font-bold text-[var(--text-secondary)]">{emptyMessage}</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map(a => (
               <AssessmentCard key={a._id} assessment={a} onViewDetails={onViewDetails} />
            ))}
         </div>
      )}
   </div>
);

/* ── Main Assessment Page ───────────────────────────────────── */
const AssessmentPage = () => {
   const navigate = useNavigate();
   const [assessments, setAssessments] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadAssessments();
   }, []);

   const loadAssessments = async () => {
      try {
         setLoading(true);
         const res = await getStudentAssessments();
         if (res?.assessments) {
            setAssessments(res.assessments);
         } else if (Array.isArray(res)) {
            setAssessments(res);
         }
      } catch (err) {
         console.error('Fetch student assessments error:', err);
      } finally {
         setLoading(false);
      }
   };

   const handleViewDetails = (id) => {
      navigate(`/student/assessment/${id}`);
   };

   const upcoming  = assessments.filter(a => a.status === 'Upcoming' || a.status === 'Active');
   const completed = assessments.filter(a => a.status === 'Completed');
   const missed    = assessments.filter(a => a.status === 'Missed');

   return (
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
         <Navbar />

         <main className="container mx-auto px-4 md:px-8 py-8 space-y-10 max-w-7xl animate-fade-in-up">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
               <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                     <ClipboardCheck size={14} /> Classroom Assessments
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight">My Assessments</h1>
                  <p className="text-sm text-[var(--text-secondary)] font-medium max-w-lg">
                     View assessments assigned to your enrolled classrooms. Click "View Details" to see full information about each assessment.
                  </p>
               </div>

               <div className="flex items-center gap-2 bg-[var(--bg-surface)] px-4 py-2.5 rounded-2xl border border-[var(--border-color)] shadow-sm shrink-0">
                  <Filter size={14} className="text-[var(--text-secondary)]" />
                  <span className="text-xs font-bold text-[var(--text-secondary)]">Total:</span>
                  <span className="text-sm font-black text-indigo-600">{assessments.length}</span>
               </div>
            </div>

            {loading ? (
               <div className="p-16 text-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] flex flex-col items-center gap-4">
                  <Loader2 size={36} className="text-indigo-600 animate-spin" />
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">Loading your assessments...</p>
               </div>
            ) : assessments.length === 0 ? (
               <div className="p-16 text-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] space-y-3">
                  <ClipboardCheck size={48} className="mx-auto text-indigo-500/30" />
                  <h2 className="text-xl font-black text-[var(--text-primary)]">No Assessments Found</h2>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto font-medium">
                     When teachers publish assessments for your enrolled classrooms, they will automatically appear here.
                  </p>
               </div>
            ) : (
               <>
                  {/* Upcoming / Active */}
                  <AssessmentSection
                     title="Upcoming & Active Assessments"
                     icon={Clock}
                     iconColor="text-blue-600"
                     assessments={upcoming}
                     emptyMessage="No upcoming assessments at this time."
                     onViewDetails={handleViewDetails}
                  />

                  {/* Completed */}
                  <AssessmentSection
                     title="Completed Assessments"
                     icon={CheckCircle2}
                     iconColor="text-purple-600"
                     assessments={completed}
                     emptyMessage="No completed assessments yet."
                     onViewDetails={handleViewDetails}
                  />

                  {/* Missed */}
                  <AssessmentSection
                     title="Missed Assessments"
                     icon={AlertCircle}
                     iconColor="text-red-500"
                     assessments={missed}
                     emptyMessage="No missed assessments."
                     onViewDetails={handleViewDetails}
                  />
               </>
            )}
         </main>
      </div>
   );
};

export default AssessmentPage;
