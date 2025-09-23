import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SEOHead from './components/SEOHead';
import GameLeaderboard from './components/GameLeaderboard';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import AuthCallback from './pages/AuthCallback';
import PlayerDashboard from './pages/PlayerDashboard';
import LocalBusinessDashboard from './pages/RestaurantDashboard';
import LocalBusinessLogin from './pages/RestaurantLogin';
import LocalBusinessRegister from './pages/RestaurantRegister';
import LocalBusinessGameManagement from './pages/RestaurantGameManagement';
import LocalBusinessGameDetails from './pages/RestaurantGameDetails';
import LocalBusinessGames from './pages/RestaurantGames';
import GameEntry from './pages/GameEntry';
import QRScanner from './pages/QRScanner';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import FreePlay from './pages/FreePlay';
import HamburgerRunnerGame from './pages/HamburgerRunnerGame';
import FoodBlasterGame from './pages/FoodBlasterGame';
import PizzaHunterGame from './pages/PizzaHunterGame';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Pricing from './pages/Pricing';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-steel-blue-900 to-royal-blue-900">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/restaurant/register" element={<LocalBusinessRegister />} />
              <Route path="/business" element={<LocalBusinessLogin />} />
              <Route path="/business/register" element={<LocalBusinessRegister />} />
              <Route path="/business/login" element={<LocalBusinessLogin />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/hamburger-runner" element={<HamburgerRunnerGame />} />
              <Route path="/food-blaster" element={<FoodBlasterGame />} />
              <Route path="/pizza-hunter" element={<PizzaHunterGame />} />
              <Route path="/restaurant-games" element={<LocalBusinessGames />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/player/dashboard" element={
                <ProtectedRoute userType="player">
                  <PlayerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute userType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/restaurant/dashboard" element={
                <ProtectedRoute userType="business">
                  <LocalBusinessDashboard />
                </ProtectedRoute>
              } />
              <Route path="/restaurant/games" element={
                <ProtectedRoute userType="business">
                  <LocalBusinessGameManagement />
                </ProtectedRoute>
              } />
              <Route path="/restaurant/games/:gameId" element={
                <ProtectedRoute userType="business">
                  <LocalBusinessGameDetails />
                </ProtectedRoute>
              } />
              <Route path="/game" element={
                <ProtectedRoute userType="player">
                  <GameEntry />
                </ProtectedRoute>
              } />
              <Route path="/scan" element={
                <ProtectedRoute userType="business">
                  <QRScanner />
                </ProtectedRoute>
              } />
              <Route path="/deposit" element={
                <ProtectedRoute userType="player">
                  <Deposit />
                </ProtectedRoute>
              } />
              <Route path="/withdraw" element={
                <ProtectedRoute userType="business">
                  <Withdraw />
                </ProtectedRoute>
              } />
              {/* 404 Catch-all route - must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;