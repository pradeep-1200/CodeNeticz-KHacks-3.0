const BASE_URL = 'http://localhost:5000/api';

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, type: 'student' }), // Defaulting to student for now as per Login.jsx
        });
        return await response.json();
    } catch (error) {
        console.error("Login failed:", error);
        return { success: false, message: "Network error" };
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return await response.json();
    } catch (error) {
        console.error("Registration failed:", error);
        return { success: false, message: "Network error" };
    }
};

export const getDashboardData = async () => {
    try {
        const response = await fetch(`${BASE_URL}/student/dashboard`);
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        return await response.json();
    } catch (error) {
        console.error("Dashboard fetch failed:", error);
        return null;
    }
};

export const getMaterials = async () => {
    try {
        const response = await fetch(`${BASE_URL}/student/classroom`);
        if (!response.ok) throw new Error('Failed to fetch materials');
        const data = await response.json();
        return data.materials || [];
    } catch (error) {
        console.error("Classroom fetch failed:", error);
        return [];
    }
};

export const getReportData = async () => {
    try {
        const response = await fetch(`${BASE_URL}/student/report`);
        if (!response.ok) throw new Error('Failed to fetch report');
        return await response.json();
    } catch (error) {
        console.error("Report fetch failed:", error);
        return null;
    }
};

export const getAssessmentQuestions = async () => {
    try {
        const response = await fetch(`${BASE_URL}/student/assessment`);
        if (!response.ok) throw new Error('Failed to fetch assessment');
        return await response.json();
    } catch (error) {
        console.error("Assessment fetch failed:", error);
        return [];
    }
};

export const completeActivity = async (type, difficulty) => {
    try {
        const response = await fetch(`${BASE_URL}/student/complete-activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, difficulty })
        });
        return await response.json();
    } catch (error) {
        console.error("Completion failed:", error);
        return { success: false };
    }
};

export const transcribeAudio = async (audioBlob) => {
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        const response = await fetch(`${BASE_URL}/stt/process`, {
            method: 'POST',
            body: formData, // No Content-Type header needed, browser handles multipart
        });

        if (!response.ok) throw new Error('Transcription failed');
        return await response.json();
    } catch (error) {
        console.error("STT failed:", error);
        return { success: false, message: error.message };
    }
};
