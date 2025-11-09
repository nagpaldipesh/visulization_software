import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- Password Strength Checker Logic ---
const checkPasswordStrength = (password) => {
  let strength = 0;
  const feedback = [];
  if (password.length >= 8) { strength += 1; } else { feedback.push("Min 8 chars"); }
  if (/[A-Z]/.test(password)) { strength += 1; } else { feedback.push("Uppercase"); }
  if (/[a-z]/.test(password)) { strength += 1; } else { feedback.push("Lowercase"); }
  if (/[0-9]/.test(password)) { strength += 1; } else { feedback.push("Number"); }
  if (/[!@#$%^&*()_\-+=]/.test(password)) { strength += 1; } else { feedback.push("Special"); }
  return { strength, feedback, isStrong: strength === 5 };
};

// --- SVG Icon Components ---
const IconLoader = () => (
  <svg className="spinner" width="20" height="20" viewBox="0 0 50 50">
    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
  </svg>
);

const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const IconBuilding = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <path d="M9 21V3"></path>
    <path d="M15 21V3"></path>
    <path d="M21 9H3"></path>
    <path d="M21 15H3"></path>
  </svg>
);

const IconMapPin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const IconEyeOff = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

// --- Embedded Styles ---
const AppStyles = () => (
  <style>{`
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6; /* bg-gray-100 */
      margin: 0;
      padding: 24px;
      color: #374151; /* text-gray-700 */
    }
    .form-container {
      max-width: 800px;
      margin: 32px auto;
      padding: 32px;
      background-color: #ffffff; /* bg-white */
      border-radius: 8px; /* rounded-lg */
      box-shadow: 0 4px 12px rgba(0,0,0,0.05); /* shadow-lg */
    }
    .form-title {
      text-align: center;
      font-size: 24px; /* text-2xl */
      font-weight: 600; /* font-semibold */
      color: #111827; /* text-gray-900 */
      margin-bottom: 24px; /* mb-6 */
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px; /* gap-5 */
    }
    @media (min-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr 1fr;
        gap: 24px; /* md:gap-6 */
      }
    }
    .form-section-header {
      grid-column: 1 / -1;
      font-size: 18px; /* text-lg */
      font-weight: 500; /* font-medium */
      color: #111827; /* text-gray-900 */
      border-bottom: 1px solid #e5e7eb; /* border-b border-gray-200 */
      padding-bottom: 8px; /* pb-2 */
      margin-top: 16px; /* mt-4 */
    }
    .input-group {
      display: flex;
      flex-direction: column;
    }
    .input-group label {
      display: block;
      font-size: 14px; /* text-sm */
      font-weight: 500; /* font-medium */
      color: #4b5563; /* text-gray-600 */
      margin-bottom: 6px; /* mb-1.5 */
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 12px; /* left-3 */
      color: #9ca3af; /* text-gray-400 */
      pointer-events: none;
    }
    .input-field {
      width: 100%;
      padding: 10px 12px 10px 40px; /* pl-10 */
      font-size: 16px; /* text-base */
      border: 1px solid #d1d5db; /* border-gray-300 */
      border-radius: 6px; /* rounded-md */
      box-shadow: 0 1px 2px rgba(0,0,0,0.05); /* shadow-sm */
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-field:focus {
      outline: none;
      border-color: #4f46e5; /* focus:border-indigo-600 */
      box-shadow: 0 0 0 2px #a5b4fc; /* focus:ring-2 focus:ring-indigo-200 */
    }
    .input-field:disabled {
      background-color: #f3f4f6; /* disabled:bg-gray-100 */
      color: #9ca3af; /* disabled:text-gray-400 */
      cursor: not-allowed;
    }
    .input-field-password {
      padding-right: 40px; /* pr-10 */
    }
    .input-field-error {
      border-color: #ef4444; /* border-red-500 */
    }
    .input-field-error:focus {
      border-color: #ef4444; /* focus:border-red-500 */
      box-shadow: 0 0 0 2px #fca5a5; /* focus:ring-2 focus:ring-red-200 */
    }
    .password-toggle {
      position: absolute;
      right: 12px; /* right-3 */
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #6b7280; /* text-gray-500 */
      display: flex;
      align-items: center;
    }
    .password-toggle:hover {
      color: #111827; /* hover:text-gray-900 */
    }
    .flex-gap-4 {
      display: flex;
      flex-direction: column;
      gap: 16px; /* gap-4 */
    }
    @media (min-width: 640px) {
      .flex-gap-4 {
        flex-direction: row;
      }
    }
    .strength-bar-container {
      height: 6px; /* h-1.5 */
      width: 100%;
      background-color: #e5e7eb; /* bg-gray-200 */
      border-radius: 3px; /* rounded-full */
      overflow: hidden;
    }
    .strength-bar {
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
    }
    .strength-feedback {
      font-size: 12px; /* text-xs */
      margin-top: 6px; /* mt-1.5 */
    }
    .text-green { color: #10b981; /* text-green-500 */ }
    .text-red { color: #ef4444; /* text-red-500 */ }
    
    .submit-button {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      margin-top: 16px; /* mt-4 */
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      font-size: 16px; /* text-base */
      font-weight: 500; /* font-medium */
      border: none;
      border-radius: 6px; /* rounded-md */
      cursor: pointer;
      transition: background-color 0.2s, opacity 0.2s;
      color: #ffffff; /* text-white */
      min-width: 150px;
    }
    .btn:disabled {
      opacity: 0.6; /* disabled:opacity-60 */
      cursor: not-allowed;
    }
    .btn-half {
      width: 50%;
    }
    .btn-green {
      background-color: #22c55e; /* bg-green-500 */
    }
    .btn-green:hover {
      background-color: #16a34a; /* hover:bg-green-600 */
    }
    .btn-blue {
      background-color: #3b82f6; /* bg-blue-500 */
    }
    .btn-blue:hover {
      background-color: #2563eb; /* hover:bg-blue-600 */
    }
    .btn-gray {
      background-color: #6b7280; /* bg-gray-500 */
      color: #ffffff;
    }
    .btn-gray:hover {
      background-color: #4b5563; /* hover:bg-gray-600 */
    }
    
    .spinner {
      animation: rotate 2s linear infinite;
    }
    .spinner .path {
      stroke: #ffffff;
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
    @keyframes rotate { 100% { transform: rotate(360deg); } }
    @keyframes dash {
      0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
      50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
      100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
    }
    
    /* OTP Form Styles */
    .otp-form-container {
      max-width: 440px;
    }
    .otp-info-text {
      text-align: center;
      color: #4b5563; /* text-gray-600 */
      margin-bottom: 24px; /* mb-6 */
    }
    .otp-info-text strong {
      color: #111827; /* text-gray-900 */
    }
    .otp-form {
      display: flex;
      flex-direction: column;
      gap: 16px; /* gap-4 */
    }
    .otp-input {
      width: 100%;
      padding: 12px;
      font-size: 20px; /* text-xl */
      text-align: center;
      letter-spacing: 8px; /* tracking-widest */
      border: 1px solid #d1d5db; /* border-gray-300 */
      border-radius: 6px; /* rounded-md */
      box-sizing: border-box; /* Fix padding issue */
    }
    .otp-input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px #a5b4fc;
    }
    .message-text {
      text-align: center;
      margin-top: 16px; /* mt-4 */
      font-weight: 500;
    }
  `}</style>
);

// --- Helper UI Components ---

const InputGroup = ({ label, name, type = 'text', value, onChange, required, disabled, icon, placeholder }) => (
  <div className="input-group">
    <label htmlFor={name}>{label}</label>
    <div className="input-wrapper">
      <div className="input-icon">{icon}</div>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  </div>
);

const PasswordStrengthIndicator = ({ strength, feedback, isStrong }) => {
  const getColor = () => {
    if (strength === 0) return '#e5e7eb'; // bg-gray-200
    if (strength <= 2) return '#ef4444'; // bg-red-500
    if (strength <= 4) return '#f59e0b'; // bg-yellow-500
    return '#10b981'; // bg-green-500
  };

  return (
    <div className="mt-2">
      <div className="strength-bar-container">
        <div
          className="strength-bar"
          style={{ width: `${(strength / 5) * 100}%`, backgroundColor: getColor() }}
        ></div>
      </div>
      {feedback.length > 0 && (
        <p className={`strength-feedback ${isStrong ? 'text-green' : 'text-red'}`}>
          {isStrong ? 'Password Strength: Excellent' : `Missing: ${feedback.join(', ')}`}
        </p>
      )}
    </div>
  );
};

const PasswordInputGroup = ({ label, name, value, onChange, required, disabled, strengthInfo, matchValue }) => {
  const [show, setShow] = useState(false);
  const passwordsMatch = matchValue === undefined || value === matchValue;

  return (
    <div className="input-group">
      <label htmlFor={name}>{label}</label>
      <div className="input-wrapper">
        <div className="input-icon">
          <IconLock />
        </div>
        <input
          type={show ? 'text' : 'password'}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`input-field input-field-password ${!passwordsMatch ? 'input-field-error' : ''}`}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {!passwordsMatch && value && (
        <p className="strength-feedback text-red">Passwords do not match.</p>
      )}
      {strengthInfo && (
        <PasswordStrengthIndicator
          strength={strengthInfo.strength}
          feedback={strengthInfo.feedback}
          isStrong={strengthInfo.isStrong}
        />
      )}
    </div>
  );
};

// --- OTP Verification Component (Step 2) ---
const OTPForm = ({ initialData, message, setMessage, navigate, generatedOtp }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleVerify = async (e) => {
      e.preventDefault();
      setMessage('');
      setIsLoading(true);

      if (otp !== generatedOtp) {
           setMessage('OTP Error: Invalid OTP code.');
           setIsLoading(false);
           return;
      }

      try {
          // CRITICAL: Call the final save API. 
          await axios.post('http://127.0.0.1:8000/api/user/register/', {
              ...initialData,
              otp: otp 
          });
          
          setMessage('Account successfully verified and created! Redirecting to login...');
          
          setTimeout(() => {
              navigate('/login');
          }, 2000);

      } catch (error) {
          setMessage(`OTP Error: ${error.response?.data?.detail || 'Final registration failed.'}`);
          console.error('Final Registration Error', error);
          setIsLoading(false);
      }
  };

  return (
    <div className="form-container otp-form-container">
      <h2 className="form-title">Verify Mobile Number</h2>
      <p className="otp-info-text">
        Verifying account for <strong>{initialData.username}</strong>.
      </p>

      <form onSubmit={handleVerify} className="otp-form">
        <InputGroup
          label="Enter OTP (6 digits)"
          name="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          disabled={isLoading}
          icon={<IconLock />}
          placeholder="123456"
        />
        
        <button type="submit" disabled={isLoading} className="btn btn-blue">
          {isLoading ? <IconLoader /> : 'Verify Code'}
        </button>
        
        {/* This button is removed to match original logic, 
            which only navigates away on success */}
        {/* <button type="button" onClick={onBack} disabled={isLoading} className="btn btn-gray">
          Back to Registration
        </button> */}
      </form>
      
      {message && (
        <p className={`message-text ${message.startsWith('OTP Error') ? 'text-red' : 'text-green'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

// --- Main App Component (Step 1) ---
export default function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    mobile_number: '',
    floor: '',
    building: '',
    street: '',
    area: '',
    landmark: '',
    pin: '',
    state: '',
    country: '',
    otp: '', // This was in your original state
  });
  const [generatedOtp, setGeneratedOtp] = useState('');
  const navigate = useNavigate();

  const passwordStrength = formData.password ? checkPasswordStrength(formData.password) : { strength: 0, feedback: [], isStrong: false };
  const passwordsMatch = formData.password === formData.confirm_password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    
    if (!passwordsMatch) {
        setMessage(`Error: Passwords do not match.`);
        setIsLoading(false);
        return; 
    }

    if (!passwordStrength.isStrong) {
      setMessage(`Error: Password does not meet security requirements. Missing: ${passwordStrength.feedback.join(', ')}.`);
      setIsLoading(false);
      return; 
    }

    // --- CRITICAL: Remove the confirm_password field from payload sent to backend ---
    const { confirm_password, ...payloadData } = formData;
    
    // Clean the payload before sending
    const payload = {};
    for (const key in payloadData) {
      if (payloadData[key] && payloadData[key].toString().trim() !== '') {
        payload[key] = payloadData[key];
      }
    }
    
    try {
      // Step 1: CHECK Registration Data
      const response = await axios.post('http://127.0.0.1:8000/api/user/check-registration/', payload);
      
      setGeneratedOtp(response.data.otp); 
      setIsRegistered(true); 
      setMessage('Registration data valid! Please enter the OTP to finalize your account.');

    } catch (error) {
      if (error.response && error.response.data) {
        // Parse the object response and extract the first message
        const errorMsg = Object.values(error.response.data).map(val => Array.isArray(val) ? val.join(' ') : val).join(' ');
        setMessage(`Error: ${errorMsg}`);
      } else {
        setMessage('An error occurred. Please try again.');
      }
      console.error('Registration error', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Show OTP Form if registered ---
  if (isRegistered) {
    return (
      <>
        <AppStyles />
        <OTPForm 
          initialData={formData} 
          message={message}
          setMessage={setMessage}
          navigate={navigate}
          generatedOtp={generatedOtp}
        />
      </>
    );
  }
  
  // --- Show Main Registration Form ---
  return (
    <>
      <AppStyles />
      <div className="form-container">
        <h2 className="form-title">
          Complete Registration
        </h2>
        
        <form onSubmit={handleSubmit} className="form-grid">
          {/* --- Account Details --- */}
          <h3 className="form-section-header">
            Account Details
          </h3>
          
          <InputGroup
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isLoading}
            icon={<IconUser />}
          />
          <InputGroup
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            icon={<IconMail />}
          />
          
          <PasswordInputGroup
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            strengthInfo={passwordStrength}
          />
          <PasswordInputGroup
            label="Confirm Password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            disabled={isLoading}
            matchValue={formData.password}
          />

          <div className="flex-gap-4">
            <InputGroup
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              disabled={isLoading}
              icon={<IconUser />}
            />
            <InputGroup
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              disabled={isLoading}
              icon={<IconUser />}
            />
          </div>
          
          <InputGroup
            label="Mobile Number"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            required
            disabled={isLoading}
            icon={<IconPhone />}
          />

          {/* --- Address Details --- */}
          <h3 className="form-section-header">
            Address Details
          </h3>

          <InputGroup
            label="Building/House No."
            name="building"
            value={formData.building}
            onChange={handleChange}
            required
            disabled={isLoading}
            icon={<IconBuilding />}
          />
          <InputGroup
            label="Street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            required
            disabled={isLoading}
            icon={<IconMapPin />}
          />
          <InputGroup
            label="Floor (Optional)"
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            disabled={isLoading}
            icon={<IconBuilding />}
          />
          <InputGroup
            label="Area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            required
            disabled={isLoading}
            icon={<IconMapPin />}
          />
          <InputGroup
            label="Landmark (Optional)"
            name="landmark"
            value={formData.landmark}
            onChange={handleChange}
            disabled={isLoading}
            icon={<IconMapPin />}
          />
          <InputGroup
            label="PIN Code"
            name="pin"
            value={formData.pin}
            onChange={handleChange}
            required
            disabled={isLoading}
            icon={<IconMapPin />}
          />
          <InputGroup
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            disabled={isLoading}
            icon={<IconMapPin />}
          />
          <InputGroup
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            disabled={isLoading}
            icon={<IconMapPin />}
          />

          {/* --- Submit Button --- */}
          <div className="submit-button">
            <button
              type="submit"
              disabled={isLoading || !passwordsMatch || (formData.password && !passwordStrength.isStrong)}
              className="btn btn-half btn-green"
            >
              {isLoading ? <IconLoader /> : 'Check Data and Send OTP'}
            </button>
          </div>
        </form>
        
        {message && (
          <p className={`message-text ${message.startsWith('Error') ? 'text-red' : 'text-green'}`}>
            {message}
          </p>
        )}

      </div>
    </>
  );
}

