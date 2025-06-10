import React, { useState } from 'react';
import userService from '../../services/userService';

const PasswordChange = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError('Current password is required');
      return false;
    }

    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await userService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.success) {
        setSuccess('Password changed successfully');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowForm(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
    setShowForm(false);
  };

  return (
    <div className="password-change-section">
      <div className="section-header">
        <h2>Password & Security</h2>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="change-password-btn"
          >
            Change Password
          </button>
        )}
      </div>

      {success && <div className="success-message">{success}</div>}

      {showForm ? (
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter your current password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter your new password"
              required
            />
            <small className="form-hint">
              Password must be at least 8 characters long
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="password-info">
          <p>Keep your account secure by using a strong password.</p>
          <div className="security-tips">
            <h4>Password Security Tips:</h4>
            <ul>
              <li>Use at least 8 characters</li>
              <li>Include uppercase and lowercase letters</li>
              <li>Add numbers and special characters</li>
              <li>Avoid common words or personal information</li>
              <li>Don't reuse passwords from other accounts</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordChange;
