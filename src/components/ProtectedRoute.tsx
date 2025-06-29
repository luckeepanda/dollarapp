import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType?: 'player' | 'restaurant';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { user, supabaseUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If there's a supabase user but no profile, redirect to complete registration
  if (supabaseUser && !user) {
    return <Navigate to="/register" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userType && user.accountType !== userType) {
    return <Navigate to={`/${user.accountType}/dashboard`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;