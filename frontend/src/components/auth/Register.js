import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    const validationErrors = validate();
    console.log('Validation errors:', validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log('Form blocked due to validation errors');
      return;
    }

    setLoading(true);
    console.log('Calling register API...');

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    console.log('Register result:', result);

    if (result.success) {
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            BidBazaar
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              name="username"
              type="text"
              required
              className="input-field"
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
              className="input-field"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              name="firstName"
              type="text"
              className="input-field"
              placeholder="First Name (Optional)"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              name="lastName"
              type="text"
              className="input-field"
              placeholder="Last Name (Optional)"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div>
            <input
              name="password"
              type="password"
              required
              className="input-field"
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
              className="input-field"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating Account...' : 'Sign up'}
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
