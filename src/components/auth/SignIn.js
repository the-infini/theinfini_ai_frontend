import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, requestOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (useOTP && !otpSent) {
        // Request OTP
        await requestOTP(formData.identifier);
        setOtpSent(true);
        setLoading(false);
        return;
      }

      if (useOTP && otpSent) {
        // Verify OTP
        await verifyOTP({
          identifier: formData.identifier,
          otp: otp
        });
      } else {
        // Login with password
        await login({
          identifier: formData.identifier,
          password: formData.password
        });
      }

      navigate('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleOTPMode = () => {
    setUseOTP(!useOTP);
    setOtpSent(false);
    setOtp('');
    setError('');
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      await requestOTP(formData.identifier);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <button
            className="back-to-home-btn"
            onClick={() => navigate('/')}
            title="Back to Homepage"
          >
            ← TheInfini AI
          </button>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="identifier">Email or Mobile</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              placeholder="Enter your email or mobile number"
              required
              disabled={otpSent}
            />
          </div>

          {!useOTP && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
            </div>
          )}

          {useOTP && otpSent && (
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
              />
              <button
                type="button"
                onClick={resendOTP}
                className="resend-otp-btn"
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Please wait...' :
             useOTP && !otpSent ? 'Send OTP' :
             useOTP && otpSent ? 'Verify OTP' : 'Sign In'}
          </button>

          <div className="auth-options">
            <button
              type="button"
              onClick={toggleOTPMode}
              className="toggle-auth-mode"
              disabled={loading}
            >
              {useOTP ? 'Use Password Instead' : 'Use OTP Instead'}
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
