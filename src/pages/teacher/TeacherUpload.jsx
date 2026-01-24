import React, { useRef, useState } from 'react';
import { Upload, FileText, Video, Image, File, CheckCircle } from 'lucide-react';
import '../../styles/TeacherUpload.css';

export default function TeacherUpload() {
    const fileInputRef = useRef(null);

    const [uploads, setUploads] = useState([
        { name: "Calculus_Intro.pdf", type: "PDF", size: "2.4 MB", date: "Just now", icon: <FileText /> },
        { name: "Geometry_Basics.mp4", type: "Video", size: "156 MB", date: "2 hours ago", icon: <Video /> },
        { name: "Algebra_Diagrams.png", type: "Image", size: "1.2 MB", date: "Yesterday", icon: <Image /> },
    ]);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            let type = "File";
            let icon = <File />;

            if (file.type.includes('image')) {
                type = "Image";
                icon = <Image />;
            } else if (file.type.includes('video')) {
                type = "Video";
                icon = <Video />;
            } else if (file.type.includes('pdf')) {
                type = "PDF";
                icon = <FileText />;
            } else if (file.type.includes('text')) {
                type = "Document";
                icon = <FileText />;
            }

            const newUpload = {
                name: file.name,
                type: type,
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                date: "Just now",
                icon: icon
            };

            setUploads([newUpload, ...uploads]);
            alert(`Successfully uploaded ${file.name}`);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] p-8">
            <div className="upload-container fade-in">
                <div className="upload-card">
                    <div className="upload-area" onClick={handleUploadClick}>
                        <div className="upload-icon">
                            <Upload size={32} color="var(--primary-blue)" />
                        </div>
                        <h2 className="upload-title">Click to upload or drag and drop</h2>
                        <p className="upload-subtitle">PDF, Video, Images or Documents (max. 500MB)</p>

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="file-types">
                        <span className="file-type-tag"><FileText size={14} /> Documents</span>
                        <span className="file-type-tag"><Video size={14} /> Video Lessons</span>
                        <span className="file-type-tag"><Image size={14} /> Graphics</span>
                    </div>

                    <button className="primary-btn" onClick={handleUploadClick}>
                        <Upload size={20} />
                        Upload New Material
                    </button>
                </div>

                <div className="recent-uploads">
                    <div className="section-title">
                        Recent Uploads
                        <span style={{ fontSize: '0.9rem', color: 'var(--primary-blue)', cursor: 'pointer' }}>View All</span>
                    </div>
                    <div className="file-list">
                        {uploads.map((file, idx) => (
                            <div key={idx} className="file-item">
                                <div className="file-info">
                                    <div className="file-icon">
                                        {file.icon}
                                    </div>
                                    <div className="file-details">
                                        <h4>{file.name}</h4>
                                        <span>{file.size} • {file.date}</span>
                                    </div>
                                </div>
                                <CheckCircle size={20} color="var(--secondary-green)" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}