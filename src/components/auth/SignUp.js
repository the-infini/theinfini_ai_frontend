import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const SignUp = () => {
  const [step, setStep] = useState(1); // 1: Registration, 2: OTP Verification
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredIdentifier, setRegisteredIdentifier] = useState('');

  const { register, verifyRegistration } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email && !formData.mobile) {
      setError('Please provide either email or mobile number');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const registrationData = {
        password: formData.password,
      };

      // Add email or mobile to registration data
      if (formData.email) {
        registrationData.email = formData.email;
        setRegisteredIdentifier(formData.email);
      }
      if (formData.mobile) {
        registrationData.mobile = formData.mobile;
        setRegisteredIdentifier(formData.mobile);
      }

      await register(registrationData);
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyRegistration({
        identifier: registeredIdentifier,
        otp: otp
      });
      navigate('/chat');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      await register({
        [formData.email ? 'email' : 'mobile']: registeredIdentifier,
        password: formData.password
      });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
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
            <h2>Verify Your Account</h2>
            <p>Enter the OTP sent to {registeredIdentifier}</p>
          </div>

          <form onSubmit={handleOTPVerification} className="auth-form">
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
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>

            <div className="auth-options">
              <button
                type="button"
                onClick={resendOTP}
                className="resend-otp-btn"
                disabled={loading}
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="back-btn"
                disabled={loading}
              >
                Back to Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
          <h2>Create Account</h2>
          <p>Join us and start chatting with AI</p>
        </div>

        <form onSubmit={handleRegistration} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email (Optional)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number (Optional)</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter your mobile number"
            />
            <small className="form-hint">
              Provide either email or mobile number (or both)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a strong password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/signin" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
