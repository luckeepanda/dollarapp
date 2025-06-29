import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PlayerDashboard from './pages/PlayerDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/free-play" element={<FreePlay />} />
            <Route path="/hamburger-runner" element={<HamburgerRunnerGame />} />
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