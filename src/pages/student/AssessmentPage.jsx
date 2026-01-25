import React from 'react';
import Navbar from '../../components/Navbar';
import Assessment from '../../components/Assessment';

const AssessmentPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-8">
         <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Interactive Assessment</h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
               Test your knowledge in a calm, supportive environment. Adjust the settings to match your preferred learning style.
            </p>
         </div>
         <Assessment />
      </div>
    </div>
  );
};

export default AssessmentPage;
