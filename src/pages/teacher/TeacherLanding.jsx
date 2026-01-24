import React from 'react';
import { Link } from 'react-router-dom';

export default function TeacherLanding() {
    return (
        <div className="page-placeholder">
            <h1>Teacher Portal</h1>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                <li><Link to="/teacher/login">Login</Link></li>
                <li><Link to="/teacher/dashboard">Dashboard</Link></li>
            </ul>
        </div>
    );
}
