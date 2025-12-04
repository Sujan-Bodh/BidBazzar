import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import OTPVerification from './OTPVerification';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.address.street) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address.city) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address.country) {
      newErrors['address.country'] = 'Country is required';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the Terms & Conditions';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...dataToSend } = formData;
      const response = await authAPI.register(dataToSend);

      setUserData(response.data);
      setStep('otp');
      toast.success('Registration successful! Please verify your email.');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = async () => {
    try {
      // After OTP verification, login the user
      const loginResult = await login({
        email: formData.email,
        password: formData.password,
      });

      if (loginResult.success) {
        toast.success('Account activated! Welcome to BidBazaar');
        navigate('/');
      }
    } catch (error) {
      toast.error('Error during login after verification');
    }
  };

  if (step === 'otp' && userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          <div>
            <h2 className="text-center text-4xl font-extrabold text-gray-900">
              BidBazaar
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Verify Your Account
            </p>
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-800 text-center">
                🎉 Registration Successful! Complete verification to activate your account
              </p>
            </div>
          </div>

          <OTPVerification
            email={formData.email}
            onVerificationComplete={handleVerificationComplete}
            loading={loading}
          />

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already verified?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            BidBazaar
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account
          </p>
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs text-purple-800 text-center">
              📝 Join BidBazaar - Your trusted auction marketplace
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  name="username"
                  type="text"
                  required
                  className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
              <div>
                <input
                  name="email"
                  type="email"
                  required
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                name="firstName"
                type="text"
                required
                className="input-field"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
              <input
                name="lastName"
                type="text"
                required
                className="input-field"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div>
              <input
                name="phone"
                type="tel"
                required
                className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Password</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="password"
                  type="password"
                  required
                  className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>

            <div className="mb-4">
              <input
                name="address.street"
                type="text"
                required
                className={`input-field ${errors['address.street'] ? 'border-red-500' : ''}`}
                placeholder="Street Address"
                value={formData.address.street}
                onChange={handleChange}
              />
              {errors['address.street'] && (
                <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  name="address.city"
                  type="text"
                  required
                  className={`input-field ${errors['address.city'] ? 'border-red-500' : ''}`}
                  placeholder="City"
                  value={formData.address.city}
                  onChange={handleChange}
                />
                {errors['address.city'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>
                )}
              </div>
              <input
                name="address.state"
                type="text"
                className="input-field"
                placeholder="State/Province"
                value={formData.address.state}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                name="address.zipCode"
                type="text"
                className="input-field"
                placeholder="ZIP/Postal Code"
                value={formData.address.zipCode}
                onChange={handleChange}
              />
              <div>
                <input
                  name="address.country"
                  type="text"
                  required
                  className={`input-field ${errors['address.country'] ? 'border-red-500' : ''}`}
                  placeholder="Country"
                  value={formData.address.country}
                  onChange={handleChange}
                />
                {errors['address.country'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['address.country']}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-900 mb-3">⚠️ Important Notice</h3>
            <p className="text-sm text-red-800 mb-4">
              All products listed on BidBazaar must be genuine and accurately described. Posting misleading or fraudulent products is strictly prohibited and will result in:
            </p>
            <ul className="text-sm text-red-800 list-disc list-inside space-y-1 mb-4">
              <li>Immediate account suspension</li>
              <li>Legal action and penalties</li>
              <li>Permanent ban from the platform</li>
              <li>Liability for fraud and damages</li>
            </ul>
            <div className="flex items-start">
              <input
                type="checkbox"
                name="termsAccepted"
                id="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-red-600 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="termsAccepted" className="ml-3 text-sm text-red-900">
                I confirm that all products I list will be genuine and accurately described. I understand the strict penalties for fraudulent listings.
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="mt-2 text-sm text-red-600">{errors.termsAccepted}</p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating Account...' : 'Continue to Verification'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
