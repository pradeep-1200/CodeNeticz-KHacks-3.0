import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from '../../components/StaffNavbar';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { getTeacherClasses, uploadMaterial } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const UploadMaterial = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await getTeacherClasses();
                setClasses(data || []);
            } catch (err) {
                console.error("Failed to fetch teacher classes:", err);
            }
        };
        fetchClasses();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            if (!title) setTitle(selected.name.split('.')[0]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) {
            const dropped = e.dataTransfer.files[0];
            setFile(dropped);
            if (!title) setTitle(dropped.name.split('.')[0]);
        }
    };

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        if (!file || !selectedClass || !title) return toast.warning("Please fill in all mandatory fields (*)");

        setIsUploading(true);
        const formData = new FormData();
        formData.append('material', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('classId', selectedClass);

        try {
            const data = await uploadMaterial(formData);

            if (data.success || data.material) {
                toast.success("Material uploaded successfully!");
                navigate('/staff/dashboard');
            } else {
                toast.error("Upload failed: " + (data.message || 'Error processing file'));
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || "Upload failed due to server error.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors">
            <StaffNavbar />

            <div className="container mx-auto px-4 md:px-6 py-12 max-w-3xl animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black mb-2 tracking-tight">Upload Study Material</h1>
                    <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium">
                        Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.
                    </p>
                </div>

                <form onSubmit={handleUpload} className="bg-[var(--bg-surface)] p-8 rounded-3xl shadow-xl border border-[var(--border-color)] space-y-6">

                    {/* Class Selector */}
                    <div>
                        <label className="block text-xs font-extrabold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                            Assign to Class <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            className="w-full p-4 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl font-bold text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-all"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">-- Select a Classroom --</option>
                            {(classes || []).map(cls => (
                                <option key={cls._id} value={cls._id}>
                                    {cls.name} ({cls.section || 'General'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Title Input */}
                    <div>
                        <label className="block text-xs font-extrabold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                            Material Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full p-4 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl font-bold text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-all"
                            placeholder="e.g. Chapter 1 Reading Notes"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-xs font-extrabold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                            Notes / Description <span className="text-[var(--text-secondary)] font-normal text-[10px] lowercase">(optional)</span>
                        </label>
                        <textarea
                            className="w-full p-4 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-all h-20"
                            placeholder="Add brief reading instructions for your students..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Drag & Drop Zone */}
                    <div>
                        <label className="block text-xs font-extrabold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                            Select File <span className="text-red-500">*</span>
                        </label>
                        <div
                            className={`border-4 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                                file 
                                    ? 'border-emerald-500/50 bg-emerald-500/10' 
                                    : 'border-[var(--border-color)] hover:border-blue-500/50 hover:bg-[var(--bg-base)]'
                            }`}
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
                                    <div className="w-14 h-14 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                        <CheckCircle size={28} />
                                    </div>
                                    <h3 className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">{file.name}</h3>
                                    <p className="text-xs text-[var(--text-secondary)] font-semibold mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="mt-3 px-3 py-1.5 bg-[var(--bg-surface)] text-red-500 text-xs font-extrabold rounded-xl border border-red-500/20 hover:bg-red-500/10"
                                    >
                                        Remove File
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-14 h-14 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center mb-3 shadow-sm animate-bounce-subtle">
                                        <UploadCloud size={28} />
                                    </div>
                                    <h3 className="text-base font-extrabold text-[var(--text-primary)]">Click or Drag file to upload</h3>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">Supports PDF, DOCX, PPT, JPG, WebM (Max 10MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading || !file || !selectedClass || !title}
                        className={`w-full mt-6 py-4 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                            (isUploading || !file || !selectedClass || !title)
                                ? 'bg-[var(--bg-base)] text-[var(--text-secondary)] cursor-not-allowed border border-[var(--border-color)]'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        {isUploading ? "Uploading Material..." : <><UploadCloud size={20} /> PUBLISH MATERIAL</>}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default UploadMaterial;
