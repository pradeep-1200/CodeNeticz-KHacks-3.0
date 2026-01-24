import React from 'react';
import { Link, Navigate } from 'react-router-dom';

export default function TeacherLanding() {
    // Since the workflow is strictly Login -> Dashboard, we can just redirect /teacher to /teacher/login
    // or provide a simple button. Given the user's emphasis on flow, a redirect might be best,
    // but a landing page is often nice. Let's redirect for now as it's the most efficient "workflow".
    return <Navigate to="/teacher/login" replace />;
}
