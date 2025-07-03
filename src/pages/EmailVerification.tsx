import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  CheckCircle, 
  RefreshCw, 
  ArrowLeft, 
  Clock,
  Shield,
  Sparkles
} from 'lucide-react';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, supabaseUser } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const email = searchParams.get('email') || supabaseUser?.email || '';
  const accountType = searchParams.get('type') || 'player';

  // Countdown timer for resend button
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  // Check if user is already verified and redirect
  useEffect(() => {
    if (user && supabaseUser?.email_confirmed_at) {
      navigate(`/${user.accountType}/dashboard`);
    }
  }, [user, supabaseUser, navigate]);

  const handleResendEmail = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    try {
      // In a real app, you'd call supabase.auth.resend() here
      // For demo purposes, we'll simulate the resend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResendSuccess(true);
      setCanResend(false);
      setTimeLeft(60);
      
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue-50 via-steel-blue-50 to-royal-blue-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-royal-blue-400/20 to-steel-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-steel-blue-400/20 to-royal-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Back button */}
          <div className="flex items-center">
            <Link 
              to="/register"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to registration</span>
            </Link>
          </div>

          {/* Main content */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
            {/* Header with animated icon */}
            <div className="text-center mb-8">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-royal-blue-500 to-steel-blue-600 rounded-2xl animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-royal-blue-600 to-steel-blue-700 p-4 rounded-2xl shadow-lg">
                  <Mail className="h-12 w-12 text-white mx-auto" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-6 w-6 text-yellow-400 animate-bounce" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-600 text-lg">
                We've sent a verification link to your inbox
              </p>
            </div>

            {/* Email display */}
            <div className="bg-gradient-to-r from-royal-blue-50 to-steel-blue-50 p-4 rounded-2xl border border-royal-blue-100 mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-royal-blue-100 p-2 rounded-xl">
                  <Mail className="h-5 w-5 text-royal-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verification email sent to:</p>
                  <p className="font-semibold text-gray-900 break-all">{email}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-1.5 rounded-full mt-0.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Check your inbox</p>
                  <p className="text-sm text-gray-600">Look for an email from Dollar App with your verification link.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-royal-blue-100 p-1.5 rounded-full mt-0.5">
                  <Shield className="h-4 w-4 text-royal-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Click the verification link</p>
                  <p className="text-sm text-gray-600">This will confirm your email and activate your {accountType} account.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-steel-blue-100 p-1.5 rounded-full mt-0.5">
                  <Clock className="h-4 w-4 text-steel-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Check spam folder</p>
                  <p className="text-sm text-gray-600">If you don't see it in a few minutes, check your spam or junk folder.</p>
                </div>
              </div>
            </div>

            {/* Resend section */}
            <div className="border-t border-gray-100 pt-6">
              {resendSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800 font-medium">
                      Verification email sent successfully!
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Didn't receive the email?
                </p>
                
                <button
                  onClick={handleResendEmail}
                  disabled={!canResend || isResending}
                  className="w-full bg-gradient-to-r from-royal-blue-600 to-steel-blue-600 text-white py-3 rounded-xl font-semibold hover:from-royal-blue-700 hover:to-steel-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isResending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : canResend ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Resend Verification Email</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Resend in {formatTime(timeLeft)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Help section */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Still having trouble?{' '}
                <Link to="/login" className="text-royal-blue-600 font-semibold hover:text-royal-blue-700">
                  Try signing in
                </Link>
                {' '}or{' '}
                <a href="mailto:support@dollarapp.com" className="text-royal-blue-600 font-semibold hover:text-royal-blue-700">
                  contact support
                </a>
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              This verification step helps keep your account secure and ensures you can receive important updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;