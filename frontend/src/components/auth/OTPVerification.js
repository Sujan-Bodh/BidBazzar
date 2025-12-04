import React, { useState, useEffect } from 'react';
import { authAPI } from '../../utils/api';
import { toast } from 'react-toastify';

const OTPVerification = ({ email, onVerificationComplete, loading }) => {
  const [emailOTP, setEmailOTP] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [emailResendTimer, setEmailResendTimer] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    let emailTimer;
    if (emailResendTimer > 0) {
      emailTimer = setTimeout(() => setEmailResendTimer(emailResendTimer - 1), 1000);
    }
    return () => clearTimeout(emailTimer);
  }, [emailResendTimer]);

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    if (emailOTP.length !== 6) {
      toast.error('Email OTP must be 6 digits');
      return;
    }

    try {
      setVerifying(true);
      await authAPI.verifyEmail({ email, otp: emailOTP });
      setEmailVerified(true);
      toast.success('Email verified successfully!');
      onVerificationComplete();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify email';
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResendLoading(true);
      const res = await authAPI.resendOTP({ email });
      setEmailResendTimer(60);
      toast.success(res.data?.message || 'Email OTP resent successfully!');
      // In development show the OTP so testers can proceed
      if (res.data?.otp) {
        console.info('Resent OTP (development):', res.data.otp);
        toast.info(`OTP (dev): ${res.data.otp}`, { autoClose: 8000 });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend email OTP';
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ✓ We've sent a verification code to your email. Please verify to activate your account.
        </p>
      </div>

      <div className={`card ${emailVerified ? 'bg-green-50 border-green-200' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Email Verification</h3>
          {emailVerified && (
            <span className="text-green-600 font-semibold">✓ Verified</span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Enter the OTP sent to: <span className="font-medium">{email}</span>
        </p>

        {!emailVerified ? (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <input
              type="text"
              maxLength="6"
              value={emailOTP}
              onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="input-field text-center text-2xl tracking-widest"
              disabled={emailVerified || verifying}
            />

            <button
              type="submit"
              disabled={verifying || emailOTP.length !== 6 || emailVerified}
              className="btn-primary w-full"
            >
              {verifying ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              type="button"
              onClick={handleResendEmail}
              disabled={emailResendTimer > 0 || resendLoading}
              className="btn-secondary w-full text-sm"
            >
              {emailResendTimer > 0
                ? `Resend in ${emailResendTimer}s`
                : 'Resend OTP'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium">Email verified successfully! Your account is now active.</p>
          </div>
        )}
      </div>

      {emailVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 text-center font-semibold">
            ✓ Account verification complete! Redirecting...
          </p>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
