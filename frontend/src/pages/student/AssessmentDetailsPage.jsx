import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getStudentAssessmentById } from '../../services/api';
import {
   ArrowLeft, ClipboardCheck, Clock, Calendar, User, BookOpen,
   FileText, Hash, Award, Play, Lock, AlertCircle, Loader2
} from 'lucide-react';

const AssessmentDetailsPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [assessment, setAssessment] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      fetchAssessment();
   }, [id]);

   const fetchAssessment = async () => {
      try {
         setLoading(true);
         setError('');
         const res = await getStudentAssessmentById(id);
         if (res?.success && res.assessment) {
            setAssessment(res.assessment);
         } else {
            setError('Assessment not found or you do not have access.');
         }
      } catch (err) {
         console.error('Failed to fetch assessment:', err);
         setError('Failed to load assessment details. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   const isActive = assessment?.status === 'Active';
   const questionCount = (assessment?.questions || []).length || (assessment?.question ? 1 : 0);
   const formattedDate = assessment?.scheduledDate
      ? new Date(assessment.scheduledDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Not scheduled';
   const teacherName = assessment?.teacherId?.name || 'Faculty';
   const className = assessment?.classId?.name || 'Classroom';
   const subject = assessment?.subject || assessment?.classId?.subject || 'General';

   const statusConfig = {
      'Upcoming':  { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',     icon: Clock,       label: 'Upcoming' },
      'Active':    { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: Play,   label: 'Active Now' },
      'Completed': { color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',  icon: ClipboardCheck, label: 'Completed' },
      'Missed':    { color: 'bg-red-500/10 text-red-600 border-red-500/20',           icon: AlertCircle, label: 'Missed' },
   };

   const currentStatus = statusConfig[assessment?.status] || statusConfig['Upcoming'];
   const StatusIcon = currentStatus.icon;

   if (loading) {
      return (
         <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
            <Navbar />
            <main className="container mx-auto px-4 md:px-8 py-16 max-w-4xl flex flex-col items-center justify-center gap-4">
               <Loader2 size={40} className="text-indigo-600 animate-spin" />
               <p className="text-sm font-semibold text-[var(--text-secondary)]">Loading assessment details...</p>
            </main>
         </div>
      );
   }

   if (error || !assessment) {
      return (
         <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
            <Navbar />
            <main className="container mx-auto px-4 md:px-8 py-16 max-w-4xl">
               <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-red-500/20 text-center space-y-4">
                  <AlertCircle size={48} className="mx-auto text-red-500/60" />
                  <h2 className="text-xl font-black text-[var(--text-primary)]">Assessment Not Found</h2>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">{error || 'This assessment may have been removed or is not available to you.'}</p>
                  <button
                     onClick={() => navigate('/student/assessment')}
                     className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-sm transition-colors shadow-md"
                  >
                     Back to Assessments
                  </button>
               </div>
            </main>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
         <Navbar />

         <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl space-y-8 animate-fade-in-up">

            {/* Back Button */}
            <button
               onClick={() => navigate('/student/assessment')}
               className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-indigo-600 transition-colors group"
            >
               <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
               Back to Assessments
            </button>

            {/* Header Card */}
            <div className="bg-[var(--bg-surface)] p-6 md:p-8 rounded-3xl border border-[var(--border-color)] shadow-lg space-y-6 relative overflow-hidden">
               {/* Decorative gradient blob */}
               <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

               <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 relative z-10">
                  <div className="space-y-3">
                     <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                        {subject}
                     </span>
                     <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] leading-tight">
                        {assessment.title}
                     </h1>
                     <p className="text-sm text-[var(--text-secondary)] font-medium flex items-center gap-2">
                        <BookOpen size={15} className="text-indigo-500" />
                        {className}
                     </p>
                  </div>

                  <span className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full border shrink-0 ${currentStatus.color}`}>
                     <StatusIcon size={14} />
                     {currentStatus.label}
                  </span>
               </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

               {/* Left Column — Info */}
               <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm space-y-5">
                  <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                     <FileText size={18} className="text-indigo-600" /> Assessment Information
                  </h2>

                  <div className="space-y-4">
                     <DetailRow icon={User} label="Instructor" value={teacherName} />
                     <DetailRow icon={Calendar} label="Scheduled Date" value={formattedDate} />
                     <DetailRow icon={Clock} label="Time Slot" value={`${assessment.startTime || '—'} – ${assessment.endTime || '—'}`} />
                     <DetailRow icon={Clock} label="Duration" value={`${assessment.duration || 30} minutes`} />
                     <DetailRow icon={Hash} label="Number of Questions" value={`${questionCount} ${questionCount === 1 ? 'Question' : 'Questions'}`} />
                     <DetailRow icon={Award} label="Total Marks" value={`${questionCount * 10} marks`} />
                  </div>
               </div>

               {/* Right Column — Description & Instructions */}
               <div className="space-y-6">
                  {/* Description */}
                  <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm space-y-3">
                     <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                        <BookOpen size={18} className="text-indigo-600" /> Description
                     </h2>
                     <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                        {assessment.description || 'No description provided for this assessment. Please follow the instructions from your teacher.'}
                     </p>
                  </div>

                  {/* Instructions */}
                  <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm space-y-3">
                     <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                        <AlertCircle size={18} className="text-amber-500" /> Instructions
                     </h2>
                     <ul className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed space-y-2">
                        {assessment.instructions ? (
                           assessment.instructions.split('\n').map((line, i) => (
                              <li key={i} className="flex items-start gap-2">
                                 <span className="text-indigo-500 mt-0.5">•</span>
                                 <span>{line}</span>
                              </li>
                           ))
                        ) : (
                           <>
                              <li className="flex items-start gap-2"><span className="text-indigo-500 mt-0.5">•</span><span>Read each question carefully before answering.</span></li>
                              <li className="flex items-start gap-2"><span className="text-indigo-500 mt-0.5">•</span><span>Once started, you must complete the assessment within the allotted time.</span></li>
                              <li className="flex items-start gap-2"><span className="text-indigo-500 mt-0.5">•</span><span>Do not refresh or leave the page during the assessment.</span></li>
                              <li className="flex items-start gap-2"><span className="text-indigo-500 mt-0.5">•</span><span>Your progress is automatically saved.</span></li>
                           </>
                        )}
                     </ul>
                  </div>
               </div>
            </div>

            {/* Start Assessment Action */}
            <div className="bg-[var(--bg-surface)] p-6 md:p-8 rounded-3xl border border-[var(--border-color)] shadow-sm">
               {isActive ? (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="space-y-1">
                        <h3 className="text-lg font-black text-emerald-600 flex items-center gap-2">
                           <Play size={18} fill="currentColor" /> Assessment is Live
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] font-medium">You can begin this assessment now.</p>
                     </div>
                     <button
                        onClick={() => navigate(`/student/assessment/${id}/attempt`)}
                        className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border border-emerald-400/30"
                     >
                        <Play size={20} fill="currentColor" /> Start Assessment
                     </button>
                  </div>
               ) : (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="space-y-1">
                        <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                           <Lock size={18} className="text-[var(--text-secondary)]" /> Assessment Not Available
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] font-medium">
                           {assessment.status === 'Upcoming'
                              ? 'This assessment will be available at the scheduled time.'
                              : assessment.status === 'Completed'
                              ? 'This assessment has already been completed.'
                              : 'This assessment window has passed.'}
                        </p>
                     </div>
                     <button
                        disabled
                        className="w-full md:w-auto px-10 py-4 bg-[var(--bg-base)] text-[var(--text-secondary)] font-extrabold text-base rounded-2xl border border-[var(--border-color)] cursor-not-allowed opacity-60 flex items-center justify-center gap-3"
                     >
                        <Lock size={18} /> Start Assessment
                     </button>
                  </div>
               )}
            </div>

         </main>

      </div>
   );
};

/* Reusable Detail Row Component */
const DetailRow = ({ icon: Icon, label, value }) => (
   <div className="flex items-start gap-3 pb-3 border-b border-[var(--border-color)] last:border-b-0 last:pb-0">
      <div className="w-8 h-8 bg-indigo-500/10 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
         <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
         <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider block">{label}</span>
         <span className="text-sm text-[var(--text-primary)] font-bold block">{value}</span>
      </div>
   </div>
);

export default AssessmentDetailsPage;
