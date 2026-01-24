import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Book,
    Shield,
    Key,
    Save
} from 'lucide-react';
import '../../styles/TeacherProfile.css';

export default function TeacherProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@school.edu",
        role: "Senior Math Teacher",
        subject: "Mathematics",
        school: "Lincoln High School",
        phone: "+1 (555) 123-4567",
        bio: "Passionate about making mathematics accessible to all students through adaptive learning technologies. Over 10 years of experience in secondary education."
    });

    const handleSave = () => {
        setIsEditing(false);
        // Api call to save profile would go here
        alert("Profile updated successfully!");
    };

    return (
        <div className="profile-container fade-in">
            <div className="profile-header">
                <div className="profile-cover"></div>
                <div className="profile-avatar-section">
                    <div className="profile-avatar">
                        {profile.firstName[0]}{profile.lastName[0]}
                    </div>
                    <div className="profile-title">
                        <h1>{profile.firstName} {profile.lastName}</h1>
                        <p>{profile.role} • {profile.school}</p>
                    </div>
                    <button
                        className={`edit-btn ${isEditing ? 'save-btn' : ''}`}
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    >
                        {isEditing ? <><Save size={18} /> Save Changes</> : "Edit Profile"}
                    </button>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-section">
                    <div className="section-header">
                        <User size={20} />
                        <h2>Personal Information</h2>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={profile.firstName}
                                disabled={!isEditing}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={profile.lastName}
                                disabled={!isEditing}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Bio</label>
                            <textarea
                                value={profile.bio}
                                disabled={!isEditing}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <div className="section-header">
                        <ContactIcons />
                        <h2>Contact & Professional</h2>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={16} />
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <div className="input-with-icon">
                                <Phone size={16} />
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Department/Subject</label>
                            <div className="input-with-icon">
                                <Book size={16} />
                                <input
                                    type="text"
                                    value={profile.subject}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, subject: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>School Location</label>
                            <div className="input-with-icon">
                                <MapPin size={16} />
                                <input
                                    type="text"
                                    value={profile.school}
                                    disabled={!isEditing}
                                    onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <div className="section-header">
                        <Shield size={20} />
                        <h2>Account Security</h2>
                    </div>
                    <div className="security-options">
                        <button className="security-btn">
                            <Key size={18} />
                            Change Password
                        </button>
                        <button className="security-btn outline">
                            Active Sessions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ContactIcons = () => (
    <div style={{ display: 'flex', gap: '4px' }}>
        <Mail size={20} />
    </div>
);
