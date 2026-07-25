/**
 * Assessment.jsx — DEPRECATED (Phase 3.5 Redesign)
 *
 * The legacy learning-mode selector (Default / Dyslexia / Dyscalculia / Dysgraphia),
 * difficulty selector, and answer-style selector have been removed as part of the
 * ACLC "Personalization without Segregation" redesign.
 *
 * Students no longer manually choose a disorder or learning mode.
 * Accessibility features will be applied automatically in Phase 5.
 *
 * The student assessment experience is now handled by:
 *   - AssessmentPage.jsx      — lists Upcoming / Completed / Missed assessments
 *   - AssessmentDetailsPage.jsx — dedicated details + Start Assessment page
 *
 * This file is preserved for backward compatibility but should NOT be imported
 * by any active component.
 */

import React from 'react';
import { ClipboardCheck } from 'lucide-react';

const Assessment = () => {
   return (
      <div className="p-12 text-center bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] space-y-4 max-w-lg mx-auto">
         <ClipboardCheck size={48} className="mx-auto text-indigo-500/40" />
         <h2 className="text-xl font-black text-[var(--text-primary)]">Component Deprecated</h2>
         <p className="text-sm text-[var(--text-secondary)] font-medium">
            This assessment component has been replaced by the new Student Assessment module.
            Please navigate to the Assessment page from the dashboard.
         </p>
      </div>
   );
};

export default Assessment;
