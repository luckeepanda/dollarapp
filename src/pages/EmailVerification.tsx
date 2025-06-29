import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Mail, 
  CheckCircle, 
  RefreshCw, 
  ArrowLeft, 
  Clock,
  Shield,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, supabaseUser } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const email = searchParams.get('email') || supabaseUser?.email || '';
  const accountType = searchParams.get('type') || 'player';

  // Check for email verification tokens in URL (when user clicks email link)
  useEffect(() => {
    const handleEmailVerification = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (type === 'signup' && accessToken && refreshToken) {
        setIsVerifying(true);
        try {
          // Set the session with the tokens from the email link
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            return;
          }

          if (data.user?.email_confirmed_at) {
            setVerificationComplete(true);
            
            // Show success message briefly, then redirect to sign-in
            setTimeout(() => {
              navigate('/login', { 
                state: { 
                  message: 'Email verified successfully! Please sign in to continue.',
                  email: data.user.email 
                }
              });
            }, 2000);
          }
        } catch (error) {
          console.error('Verification error:', error);
        } finally {
          setIsVerifying(false);
        }
      }
    };

    handleEmailVerification();
  }, [navigate]);

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
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) {
        console.error('Error resending email:', error);
        throw error;
      }
      
      setResendSuccess(true);
      setCanResend(false);
      setTimeLeft(60);
      
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      alert('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show verification in progress
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying your email...</h2>
          <p className="text-gray-600">Please wait while we confirm your account.</p>
        </div>
      </div>
    );
  }

  // Show verification complete
  if (verificationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20 text-center max-w-md">
          <div className="bg-green-100 p-4 rounded-2xl w-20 h-20 mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-4">Your account has been successfully verified.</p>
          <p className="text-sm text-gray-500">Redirecting you to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 p-4 rounded-2xl shadow-lg">
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
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-100 mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <Mail className="h-5 w-5 text-blue-600" />
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
                <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Click the verification link</p>
                  <p className="text-sm text-gray-600">This will automatically redirect you to the sign-in page to complete setup.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 p-1.5 rounded-full mt-0.5">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Check spam folder</p>
                  <p className="text-sm text-gray-600">If you don't see it in a few minutes, check your spam or junk folder.</p>
                </div>
              </div>
            </div>

            {/* Important note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Important:</p>
                  <p className="text-sm text-amber-700">
                    After clicking the verification link, you'll be redirected to the sign-in page. 
                    Use your email and password to complete the login process.
                  </p>
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
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
                Already verified?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                  Sign in here
                </Link>
                {' '}or{' '}
                <a href="mailto:support@dollarapp.com" className="text-blue-600 font-semibold hover:text-blue-700">
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