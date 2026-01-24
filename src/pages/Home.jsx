import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="page-placeholder">
            <h1>Welcome to ACLC</h1>
            <p>Adaptive Cognitive Learning Classroom</p>
            <div style={{ marginTop: '20px' }}>
                <Link to="/teacher/login" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                    Teacher Login
                </Link>
            </div>
        </div>
    );
}
