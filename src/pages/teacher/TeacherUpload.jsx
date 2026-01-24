import React, { useState, useEffect } from 'react';
import TeacherNavbar from '../../components/TeacherNavbar';
import { Upload, FileText, Video, Image, File, CheckCircle, AlertCircle, X } from 'lucide-react';
import apiClient from '../../api/client';

const TeacherUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('pdf');
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await apiClient.get('/teacher/materials');
            setMaterials(response.data || []);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        if (!title) {
            setTitle(file.name.split('.')[0]);
        }
        
        // Auto-detect file type
        const extension = file.name.split('.').pop().toLowerCase();
        if (['pdf'].includes(extension)) setType('pdf');
        else if (['mp4', 'avi', 'mov'].includes(extension)) setType('video');
        else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) setType('image');
        else if (['doc', 'docx'].includes(extension)) setType('word');
        else if (['ppt', 'pptx'].includes(extension)) setType('ppt');
        else setType('pdf');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setUploadStatus({ type: 'error', message: 'Please select a file' });
            return;
        }

        setUploading(true);
        setUploadStatus(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('type', type);

            const response = await apiClient.post('/teacher/upload-material', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setUploadStatus({ type: 'success', message: 'Material uploaded successfully!' });
                setSelectedFile(null);
                setTitle('');
                setDescription('');
                setType('pdf');
                fetchMaterials();
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Upload failed. Please try again.' 
            });
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'video': return <Video size={20} className="text-red-500" />;
            case 'image': return <Image size={20} className="text-green-500" />;
            case 'word': return <FileText size={20} className="text-blue-500" />;
            case 'ppt': return <FileText size={20} className="text-orange-500" />;
            default: return <FileText size={20} className="text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors duration-300">
            <TeacherNavbar />
            
            <main className="container mx-auto px-6 py-8 space-y-8">
                {/* Header */}
                <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-lg border border-[var(--border-color)]">
                    <h1 className="text-3xl font-bold mb-2">Upload Materials</h1>
                    <p className="text-[var(--text-secondary)]">
                        Share learning resources with your students. Upload PDFs, videos, and other educational content.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Upload Form */}
                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold mb-6">Upload New Material</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* File Upload Area */}
                            <div 
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                    dragActive 
                                        ? 'border-[var(--accent-primary)] bg-blue-50 dark:bg-blue-900/20' 
                                        : 'border-[var(--border-color)] hover:border-[var(--accent-primary)]'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Upload size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
                                <p className="text-lg font-semibold mb-2">Drop files here or click to browse</p>
                                <p className="text-sm text-[var(--text-secondary)] mb-4">
                                    Supports PDF, Video, Images, Word, PowerPoint
                                </p>
                                <input
                                    type="file"
                                    onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".pdf,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif,.doc,.docx,.ppt,.pptx"
                                />
                                <label 
                                    htmlFor="file-upload" 
                                    className="inline-block px-6 py-2 bg-[var(--accent-primary)] text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                                >
                                    Choose File
                                </label>
                                
                                {selectedFile && (
                                    <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getFileIcon(type)}
                                            <span className="text-sm font-medium">{selectedFile.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFile(null)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Form Fields */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                    placeholder="Enter material title"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] h-24 resize-none"
                                    placeholder="Brief description of the material"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                                >
                                    <option value="pdf">PDF Document</option>
                                    <option value="video">Video</option>
                                    <option value="image">Image</option>
                                    <option value="word">Word Document</option>
                                    <option value="ppt">PowerPoint</option>
                                </select>
                            </div>

                            {/* Status Message */}
                            {uploadStatus && (
                                <div className={`p-4 rounded-lg flex items-center gap-2 ${
                                    uploadStatus.type === 'success' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                }`}>
                                    {uploadStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    {uploadStatus.message}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={uploading || !selectedFile}
                                className="w-full py-3 bg-[var(--accent-primary)] text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {uploading ? 'Uploading...' : 'Upload Material'}
                            </button>
                        </form>
                    </div>

                    {/* Materials List */}
                    <div className="bg-[var(--bg-primary)] p-6 rounded-2xl shadow-lg border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold mb-6">Uploaded Materials</h2>
                        
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {materials.length > 0 ? materials.map((material, index) => (
                                <div key={index} className="p-4 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                                    <div className="flex items-start gap-3">
                                        {getFileIcon(material.type)}
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{material.title}</h3>
                                            {material.desc && (
                                                <p className="text-sm text-[var(--text-secondary)] mt-1">{material.desc}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                                                <span>Type: {material.type.toUpperCase()}</span>
                                                <span>Date: {material.date}</span>
                                                <span>Likes: {material.likes}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-[var(--text-secondary)]">
                                    <File size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No materials uploaded yet</p>
                                    <p className="text-sm">Upload your first material to get started</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherUpload;