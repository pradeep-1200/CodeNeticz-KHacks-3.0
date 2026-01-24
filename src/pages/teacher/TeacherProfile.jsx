import React from 'react';

export default function TeacherProfile() {
    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] p-8">
            <div className="max-w-2xl mx-auto bg-[var(--bg-primary)] p-8 rounded-2xl">
                <h1 className="text-2xl font-bold mb-4">Teacher Profile</h1>
                <p className="text-[var(--text-secondary)]">Manage your profile settings.</p>
            </div>
        </div>
    );
}