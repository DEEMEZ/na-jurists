"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  caseId: string;
}

const OTPModal = ({ isOpen, onClose, onVerified, caseId }: OTPModalProps) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, caseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccessMessage('OTP sent successfully! Check your email.');
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, caseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Store verification token
      localStorage.setItem('case_access_token', data.token);

      setSuccessMessage('Verification successful!');
      setTimeout(() => {
        onVerified();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, caseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setSuccessMessage('OTP resent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setError('');
    setSuccessMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2c415e] to-[#4a6789] p-6 text-white relative">
          <button
            onClick={() => {
              onClose();
              resetModal();
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold">Verify Your Email</h2>
          <p className="text-white/90 text-sm mt-2">
            {step === 'email'
              ? 'Enter your email to receive an OTP'
              : 'Enter the OTP sent to your email'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOTP}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-[#2c415e] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c415e] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2c415e] text-white rounded-lg font-medium hover:bg-[#1a2a3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-4">
                <label htmlFor="otp" className="block text-sm font-medium text-[#2c415e] mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c415e] focus:border-transparent text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Sent to: <span className="font-medium">{email}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-[#2c415e] text-white rounded-lg font-medium hover:bg-[#1a2a3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-[#2c415e] hover:underline"
                >
                  Change Email
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-[#2c415e] hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPModal;
