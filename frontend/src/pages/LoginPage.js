import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MonkeyFace from './MonkeyFace';

// --- Password Strength Checker Logic (for use in reset form) ---
const checkPasswordStrength = (password) => {
  let strength = 0;
  const feedback = [];
  if (password.length >= 8) { strength += 1; } else { feedback.push("Minimum 8 characters"); }
  if (/[A-Z]/.test(password)) { strength += 1; } else { feedback.push("At least one uppercase letter (A-Z)"); }
  if (/[a-z]/.test(password)) { strength += 1; } else { feedback.push("At least one lowercase letter (a-z)"); }
  if (/[0-9]/.test(password)) { strength += 1; } else { feedback.push("At least one digit (0-9)"); }
  if (/[!@#$%^&*()_\-+=]/.test(password)) { strength += 1; } else { feedback.push("At least one special character (!@#$%^&*()_-+=)"); }
  return { strength, feedback, isStrong: strength === 5 };
};

// small inline SVG spinner component
const Spinner = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 50 50" style={{ verticalAlign: 'middle' }}>
    <circle cx="25" cy="25" r="20" stroke="#888" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="31.4 31.4">
      <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite" />
    </circle>
  </svg>
);

// --- OTP Verification Component for 2FA Login ---
const LoginOTPForm = ({ identifier, password, navigate, onBackToLogin }) => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const cooldownRef = useRef(null);

  useEffect(() => {
    // start cooldown when component mounts
    setResendCooldown(30);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, []);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/verify-challenge/', {
        identifier: identifier,
        otp: otp.trim()
      });

      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setMessage('Login successful! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1200);

    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'OTP verification failed.';
      setMessage(`Error: ${errorMsg}`);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setMessage('');
    setIsLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/token/resend-challenge/', { identifier });
      setMessage('OTP resent. Check your email or phone.');
      setResendCooldown(30);
      cooldownRef.current = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) {
            clearInterval(cooldownRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: '20px' }}>
      <h2>Two-Factor Authentication</h2>
      <p>A verification code has been sent to your registered contact.</p>
      <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        <label style={{ fontSize: '0.9rem' }}>Enter OTP (6 digits):</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
          maxLength="6"
          disabled={isLoading}
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          placeholder="123456"
          inputMode="numeric"
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" disabled={isLoading || otp.length < 6} style={{ padding: '10px', flex: 1 }}>
            {isLoading ? <><Spinner /> Verifying...</> : 'Verify OTP'}
          </button>
          <button type="button" onClick={handleResend} disabled={isLoading || resendCooldown > 0} style={{ padding: '10px', width: '160px' }}>
            {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
          </button>
        </div>
      </form>
      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBackToLogin} style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>
          Back to Login
        </button>
      </div>
      {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green', marginTop: '12px' }}>{message}</p>}
    </div>
  );
};

// --- Final Password Reset Form (with API connection) ---
const ResetPasswordFinalForm = ({ identifier, setIsForgotPassword }) => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, feedback: [], isStrong: false });
  const [showPassword, setShowPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // no-op default
  }, []);

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    setPasswordStrength(checkPasswordStrength(e.target.value));
  };

  const getPasswordColor = (strength) => {
    if (strength === 0) return '#ccc';
    if (strength <= 2) return 'red';
    if (strength <= 4) return 'orange';
    return 'green';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    if (!passwordStrength.isStrong) {
      setMessage(`Password is not strong enough. Missing: ${passwordStrength.feedback.join(', ')}`);
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/user/password-reset-confirm/', {
        identifier: identifier,
        otp: otp.trim(),
        new_password: newPassword
      });

      setMessage(response.data.message + " Redirecting to login...");
      setIsError(false);

      setTimeout(() => {
        setIsForgotPassword(false);
      }, 1600);

    } catch (error) {
      let errorMsg = "An unknown error occurred.";
      if (error.response && error.response.data) {
        if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail.join(' ');
        } else {
          errorMsg = error.response.data.detail || errorMsg;
        }
      }
      setMessage(`Error: ${errorMsg}`);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendResetOTP = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setMessage('');
    try {
      await axios.post('http://127.0.0.1:8000/api/user/password-reset-request/', { identifier });
      setMessage('Reset OTP resent.');
      setResendCooldown(30);
      const iv = setInterval(() => {
        setResendCooldown(s => {
          if (s <= 1) {
            clearInterval(iv);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to resend reset OTP.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: '20px' }}>
      <h2>Set New Password</h2>
      <p>Please enter the OTP sent to your email and your new password.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        <div>
          <label>Email or Username:</label>
          <input type="text" value={identifier} disabled style={{ width: '100%', padding: '8px', background: '#eee' }} />
        </div>
        <div>
          <label>OTP from Email:</label>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))} required disabled={isLoading} style={{ width: '100%', padding: '8px' }} />
          <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
            <button type="button" onClick={handleResendResetOTP} disabled={isLoading || resendCooldown > 0} style={{ padding: '8px' }}>
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
            </button>
            <button type="button" onClick={() => setIsForgotPassword(false)} style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
        <div>
          <label>New Password:</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={handlePasswordChange} required disabled={isLoading} style={{ width: '100%', padding: '8px' }} />
            <button type="button" onClick={() => setShowPassword(s => !s)} style={{ padding: '8px' }}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div style={{ height: '6px', backgroundColor: '#eee', marginTop: '6px', borderRadius: 4 }}>
            <div style={{ width: `${(passwordStrength.strength / 5) * 100}%`, height: '100%', backgroundColor: getPasswordColor(passwordStrength.strength), transition: 'width 0.25s' }}></div>
          </div>
          {newPassword && !passwordStrength.isStrong && (
            <p style={{ fontSize: '0.8em', color: 'red', margin: '6px 0 0 0' }}>{`Missing: ${passwordStrength.feedback.join(', ')}`}</p>
          )}
        </div>
        <div>
          <label>Confirm New Password:</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} style={{ width: '100%', padding: '8px' }} />
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p style={{ fontSize: '0.8em', color: 'red', margin: '6px 0 0 0' }}>Passwords do not match.</p>
          )}
        </div>
        <button type="submit" disabled={isLoading || !passwordStrength.isStrong || newPassword !== confirmPassword} style={{ padding: '10px' }}>
          {isLoading ? <><Spinner /> Resetting...</> : 'Set New Password'}
        </button>
      </form>
      {message && <p style={{ color: isError ? 'red' : 'green', marginTop: '12px' }}>{message}</p>}
    </div>
  );
};

// --- Forgot Password Form Component ---
const ForgotPasswordForm = ({ setIsForgotPassword }) => {
  const [identifier, setIdentifier] = useState(localStorage.getItem('rememberedIdentifier') || '');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/user/password-reset-request/', {
        identifier: identifier.trim()
      });
      setMessage(response.data.message);
      setOtpSent(true);
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.detail || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (otpSent) {
    return <ResetPasswordFinalForm identifier={identifier} setIsForgotPassword={setIsForgotPassword} />;
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: '20px' }}>
      <h2>Reset Password</h2>
      <p>Enter your email address or username and we'll send you an OTP to reset your password.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        <div>
          <label>Email or Username:</label>
          <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required disabled={isLoading} style={{ width: '100%', padding: '8px' }} placeholder="your.email@example.com or username" />
        </div>
        <button type="submit" disabled={isLoading} style={{ padding: '10px' }}>
          {isLoading ? <><Spinner /> Sending...</> : 'Send Reset OTP'}
        </button>
      </form>
      {message && <p style={{ color: isError ? 'red' : 'green', marginTop: '10px' }}>{message}</p>}
      <div style={{ textAlign: 'center', marginTop: '15px' }}>
        <button onClick={() => setIsForgotPassword(false)} style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

// --- Main Login Component ---
const LoginPage = () => {
  const [formData, setFormData] = useState({ identifier: localStorage.getItem('rememberedIdentifier') || '', password: '' });
  const [message, setMessage] = useState('');
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('rememberedIdentifier'));
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [coverEyes, setCoverEyes] = useState(false);
  const [eyeDirection, setEyeDirection] = useState('center'); // 'left' | 'right' | 'center'

  const handleIdentifierChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, identifier: value }));

    if (value.length % 2 === 0) setEyeDirection('left');
    else setEyeDirection('right');
  };

  const handlePasswordFocus = () => setCoverEyes(true);
  const handlePasswordBlur = () => setCoverEyes(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (rememberMe) localStorage.setItem('rememberedIdentifier', formData.identifier);
    else localStorage.removeItem('rememberedIdentifier');
  }, [rememberMe, formData.identifier]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        identifier: formData.identifier.trim(),
        password: formData.password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setMessage('Login successful! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      if (error.response) {
        const { data, status } = error.response;
        // The backend now sends specific error messages in data.detail
        let detail = data.detail || data.error || data.message || '';

        // This handles the new, specific messages from the backend's CustomTokenObtainPairView
        if (typeof detail === 'object') {
          detail = data.detail.detail || JSON.stringify(data.detail);
        }

        const detailLower = String(detail).toLowerCase();
        const isOTPRequired = status === 202 || data.otp_required === true || detailLower.includes('otp sent');

        if (isOTPRequired) {
          setMessage('OTP sent! Check your email.');
          setShowOTPForm(true);
        } else {
          // Display the specific error message from the backend
          setMessage(`Error: ${detail}`);
        }
      } else {
        setMessage('An error occurred. Please try again.');
      }
      console.error('Login error', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showOTPForm) return <LoginOTPForm identifier={formData.identifier} password={formData.password} navigate={navigate} onBackToLogin={() => { setShowOTPForm(false); setMessage(''); }} />;
  if (isForgotPassword) return <ForgotPasswordForm setIsForgotPassword={setIsForgotPassword} />;

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '30px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>

      {/* Monkey animation placeholder */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <MonkeyFace
          lookLeft={eyeDirection === 'left'}
          lookRight={eyeDirection === 'right'}
          coverEyes={coverEyes}
        />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontWeight: 'bold' }}>Login ID</label>
          <input
            name="identifier"
            type="text"
            value={formData.identifier}
            onChange={handleIdentifierChange}
            onFocus={() => setEyeDirection('center')}
            required
            placeholder="Username, Email, or Mobile"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Password</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              required
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              style={{
                padding: '10px',
                backgroundColor: '#eee',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => setIsForgotPassword(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Forgot?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '12px',
            backgroundColor: '#0078D4',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {isLoading ? <><Spinner /> Logging in...</> : 'Login'}
        </button>
      </form>

      {message && (
        <p style={{
          color: message.startsWith('Error') ? 'red' : 'green',
          marginTop: '16px',
          textAlign: 'center',
        }}>
          {message}
        </p>
      )}
    </div>

  );
};

export default LoginPage;