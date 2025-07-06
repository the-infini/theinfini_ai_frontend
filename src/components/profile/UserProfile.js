import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import ProfilePicture from './ProfilePicture';
import PasswordChange from './PasswordChange';
import './Profile.css';

const UserProfile = () => {
  const { updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      if (response.success) {
        setProfile(response.data.profile);
        setFormData({
          firstName: response.data.profile.firstName || '',
          lastName: response.data.profile.lastName || '',
          email: response.data.profile.email || '',
          mobile: response.data.profile.mobile || '',
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const updateData = {};

      // Only include changed fields
      if (formData.firstName !== (profile.firstName || '')) {
        updateData.firstName = formData.firstName;
      }
      if (formData.lastName !== (profile.lastName || '')) {
        updateData.lastName = formData.lastName;
      }
      if (formData.email !== (profile.email || '')) {
        updateData.email = formData.email;
      }
      if (formData.mobile !== (profile.mobile || '')) {
        updateData.mobile = formData.mobile;
      }

      if (Object.keys(updateData).length > 0) {
        const response = await userService.updateProfile(updateData);
        if (response.success) {
          setProfile(response.data.profile);
          updateUser(response.data.profile);
          setEditing(false);
          setError('');
        }
      } else {
        setEditing(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      mobile: profile.mobile || '',
    });
    setEditing(false);
    setError('');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading && !profile) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="profile-content">
        {/* Profile Picture Section */}
        <div className="profile-section">
          <ProfilePicture
            profile={profile}
            onUpdate={(updatedProfile) => {
              setProfile(updatedProfile);
              updateUser(updatedProfile);
            }}
          />
        </div>

        {/* Basic Information Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Basic Information</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="edit-btn"
              >
                Edit
              </button>
            ) : (
              <div className="edit-actions">
                <button
                  onClick={handleSaveProfile}
                  className="save-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="cancel-btn"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                  />
                ) : (
                  <div className="form-value">
                    {profile?.firstName || 'Not provided'}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                ) : (
                  <div className="form-value">
                    {profile?.lastName || 'Not provided'}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              ) : (
                <div className="form-value">
                  {profile?.email || 'Not provided'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              {editing ? (
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                />
              ) : (
                <div className="form-value">
                  {profile?.mobile || 'Not provided'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="profile-section">
          <PasswordChange />
        </div>

        {/* Subscription Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Subscription & Billing</h2>
          </div>
          <div className="profile-form">
            <div className="subscription-section">
              <p className="subscription-description">
                Manage your subscription, view billing history, and upgrade your plan.
              </p>
              <button
                onClick={() => navigate('/pricing-billing')}
                className="pricing-billing-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Pricing & Billing
              </button>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Account Actions</h2>
          </div>
          <div className="profile-form">
            <div className="logout-section">
              <p className="logout-description">
                Sign out of your account and return to the home page.
              </p>
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
