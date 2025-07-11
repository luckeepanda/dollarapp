import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import AuthCallback from './pages/AuthCallback';
import PlayerDashboard from './pages/PlayerDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantLogin from './pages/RestaurantLogin';
import RestaurantRegister from './pages/RestaurantRegister';
import RestaurantGameManagement from './pages/RestaurantGameManagement';
import RestaurantGameDetails from './pages/RestaurantGameDetails';
import RestaurantGames from './pages/RestaurantGames';
import GameEntry from './pages/GameEntry';
import QRScanner from './pages/QRScanner';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import FreePlay from './pages/FreePlay';
import HamburgerRunnerGame from './pages/HamburgerRunnerGame';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-steel-blue-900 to-royal-blue-900">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/restaurant/login" element={<RestaurantLogin />} />
            <Route path="/restaurant/register" element={<RestaurantRegister />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/free-play" element={<FreePlay />} />
            <Route path="/hamburger-runner" element={<HamburgerRunnerGame />} />
            <Route path="/restaurant-games" element={<RestaurantGames />} />
            <Route path="/player/dashboard" element={
              <ProtectedRoute userType="player">
                <PlayerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/restaurant/dashboard" element={
              <ProtectedRoute userType="restaurant">
                <RestaurantDashboard />
              </ProtectedRoute>
            } />
            <Route path="/restaurant/games" element={
              <ProtectedRoute userType="restaurant">
                <RestaurantGameManagement />
              </ProtectedRoute>
            } />
            <Route path="/restaurant/games/:gameId" element={
              <ProtectedRoute userType="restaurant">
                <RestaurantGameDetails />
              </ProtectedRoute>
            } />
            <Route path="/game" element={
              <ProtectedRoute userType="player">
                <GameEntry />
              </ProtectedRoute>
            } />
            <Route path="/scan" element={
              <ProtectedRoute userType="restaurant">
                <QRScanner />
              </ProtectedRoute>
            } />
            <Route path="/deposit" element={
              <ProtectedRoute userType="player">
                <Deposit />
              </ProtectedRoute>
            } />
            <Route path="/withdraw" element={
              <ProtectedRoute userType="restaurant">
                <Withdraw />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;