import React, { useState } from 'react';
import userService from '../../services/userService';

const ProfilePicture = ({ profile, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // In a real application, you would upload to a file storage service
      // For now, we'll create a data URL as a placeholder
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imageUrl = e.target.result;
          const response = await userService.uploadProfilePicture(imageUrl);
          
          if (response.success) {
            onUpdate(response.data.profile);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  const removeProfilePicture = async () => {
    setUploading(true);
    setError('');

    try {
      const response = await userService.uploadProfilePicture('');
      if (response.success) {
        onUpdate(response.data.profile);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    const firstName = profile?.firstName || '';
    const lastName = profile?.lastName || '';
    const email = profile?.email || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="profile-picture-section">
      <h2>Profile Picture</h2>
      
      <div className="profile-picture-container">
        <div className="profile-picture">
          {profile?.profilePicture ? (
            <img 
              src={profile.profilePicture} 
              alt="Profile" 
              className="profile-image"
            />
          ) : (
            <div className="profile-initials">
              {getInitials()}
            </div>
          )}
          
          {uploading && (
            <div className="upload-overlay">
              <div className="upload-spinner"></div>
            </div>
          )}
        </div>

        <div className="profile-picture-actions">
          <label className="upload-btn">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </label>
          
          {profile?.profilePicture && (
            <button
              onClick={removeProfilePicture}
              className="remove-btn"
              disabled={uploading}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <p className="profile-picture-hint">
        Upload a photo to personalize your profile. Supported formats: JPG, PNG, GIF. Max size: 5MB.
      </p>
    </div>
  );
};

export default ProfilePicture;
