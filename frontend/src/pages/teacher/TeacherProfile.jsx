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

import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client'; // Import API client

export default function TeacherProfile() {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: "Teacher",
        subject: "",
        school: "",
        phone: "",
        bio: ""
    });

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/auth/profile');
                const p = response.data;
                const names = p.name ? p.name.split(' ') : ["", ""];
                setProfile({
                    firstName: names[0] || "",
                    lastName: names.slice(1).join(' ') || "",
                    email: p.email || "",
                    role: p.role || "Teacher",
                    subject: p.subject || "",
                    school: p.school || "",
                    phone: p.phone || "",
                    bio: p.bio || ""
                });
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            const updatedData = {
                name: `${profile.firstName} ${profile.lastName}`.trim(),
                email: profile.email,
                // role: profile.role, // Typically role isn't editable by user directly
                school: profile.school,
                subject: profile.subject,
                phone: profile.phone,
                bio: profile.bio
            };

            const response = await apiClient.put('/auth/profile', updatedData);

            // Update context
            login(response.data);

            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to update profile");
        }
    };

    if (loading) return <div className="profile-container"><p>Loading profile...</p></div>;

    return (
        <div className="profile-container fade-in">
            <div className="profile-header">
                <div className="profile-cover"></div>
                <div className="profile-avatar-section">
                    <div className="profile-avatar">
                        {profile.firstName ? profile.firstName.charAt(0) : ''}
                        {profile.lastName ? profile.lastName.charAt(0) : ''}
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
