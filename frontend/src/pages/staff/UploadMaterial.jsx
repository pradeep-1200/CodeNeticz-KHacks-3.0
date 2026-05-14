import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from '../../components/StaffNavbar';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

const UploadMaterial = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Mock Teacher ID
    const TEACHER_ID = "65b2a3c4e8f1a2b3c4d5e6f7";

    useEffect(() => {
        // Fetch classes to populate dropdown
        fetch(`http://localhost:5000/api/classes/teacher/${TEACHER_ID}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setClasses(data.classes);
            });
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            if (!title) setTitle(e.target.files[0].name.split('.')[0]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            if (!title) setTitle(e.dataTransfer.files[0].name.split('.')[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !selectedClass) return alert("Please select a class and a file.");

        setIsUploading(true);
        const formData = new FormData();
        formData.append('material', file);
        formData.append('title', title);
        formData.append('classId', selectedClass);
        // formData.append('type', 'pdf'); // Backend detects or defaults, but can send specific

        try {
            const res = await fetch('http://localhost:5000/api/materials/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success || data.material) { // Adjusted based on previous route check
                alert("Material uploaded successfully!");
                navigate('/staff/dashboard');
            } else {
                alert("Upload failed: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Upload failed due to server error.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <StaffNavbar />

            <div className="container mx-auto px-6 py-12 max-w-3xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-slate-800 mb-2">Upload Material</h1>
                    <p className="text-slate-500">Share documents, PDFs, or learning resources with your class.</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">

                    {/* Class Selector */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Assign to Class</label>
                        <select
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Select a Class --</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id}>
                                    {cls.name} ({cls.section})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Title Input */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Material Title</label>
                        <input
                            type="text"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="e.g. Chapter 1 Notes"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Drag & Drop Zone */}
                    <div
                        className={`border-4 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${file ? 'border-green-200 bg-green-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('fileInput').click()}
                    >
                        <input
                            id="fileInput"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {file ? (
                            <>
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-green-800">{file.name}</h3>
                                <p className="text-green-600 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="mt-4 px-4 py-2 bg-white text-red-500 text-sm font-bold rounded-lg border border-red-100 hover:bg-red-50"
                                >
                                    Remove File
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm animate-bounce-subtle">
                                    <UploadCloud size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-700">Click or Drag file to upload</h3>
                                <p className="text-slate-400 mt-2">Supports PDF, DOCX, PPT, JPG (Max 10MB)</p>
                            </>
                        )}
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !file || !selectedClass}
                        className={`w-full mt-8 py-4 rounded-xl font-black text-xl shadow-lg transition-all flex items-center justify-center gap-2 ${(isUploading || !file || !selectedClass)
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                    >
                        {isUploading ? "Uploading..." : <><UploadCloud size={24} /> PUBLISH MATERIAL</>}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default UploadMaterial;
