import React from 'react';
import { useParams } from 'react-router-dom';

export default function TeacherClassroom() {
    const { id } = useParams();
    return (
        <div className="page-placeholder">
            <h1>Classroom {id}</h1>
            <p>Manage classroom details.</p>
        </div>
    );
}
