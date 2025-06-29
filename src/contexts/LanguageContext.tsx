import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.login': 'Sign In',
    'nav.register': 'Get Started',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    'nav.freePlay': 'FREE PLAY',
    
    // Landing Page
    'landing.title': 'Dollar App',
    'landing.subtitle': 'Pay $1, play for prizes, redeem at restaurants.',
    'landing.getStarted': 'Get Started',
    'landing.signIn': 'Sign In',
    'landing.freePlay': 'FREE PLAY',
    'landing.howItWorks': 'How It Works',
    'landing.howItWorksSubtitle': 'Join the food game revolution with our simple three-step process',
    'landing.step1.title': '1. Deposit & Play',
    'landing.step1.desc': 'Add funds via Apple Pay, Cash App, or Zelle. Enter games for just $1 each.',
    'landing.step2.title': '2. Win Prizes',
    'landing.step2.desc': 'Compete for growing prize pools. Winners receive QR codes for restaurant redemption.',
    'landing.step3.title': '3. Redeem & Enjoy',
    'landing.step3.desc': 'Use QR codes at participating restaurants. Instant verification and secure payouts.',
    'landing.cta.title': 'Ready to Join the Game?',
    'landing.cta.subtitle': 'Start playing today and discover amazing food experiences in your area.',
    'landing.cta.button': 'Create Account',
    
    // Authentication
    'auth.welcomeBack': 'Welcome back',
    'auth.signInSubtitle': 'Sign in to your Dollar App account',
    'auth.createAccount': 'Create Account',
    'auth.createAccountSubtitle': 'Join the Dollar App community',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.username': 'Username',
    'auth.accountType': 'Account Type',
    'auth.player': 'Player',
    'auth.playerDesc': 'Play games & win prizes',
    'auth.restaurant': 'Restaurant',
    'auth.restaurantDesc': 'Accept QR redemptions',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Create Account',
    'auth.signingIn': 'Signing in...',
    'auth.creatingAccount': 'Creating Account...',
    'auth.continueWithGoogle': 'Continue with Google',
    'auth.continueWithApple': 'Continue with Apple',
    'auth.orContinueWith': 'Or continue with email',
    'auth.orCreateWith': 'Or create account with email',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.emailPlaceholder': 'Enter your email',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.createPasswordPlaceholder': 'Create a password',
    'auth.confirmPasswordPlaceholder': 'Confirm your password',
    'auth.usernamePlaceholder': 'Choose a username',
    'auth.oauthNote': 'OAuth accounts are created instantly. Email accounts require verification.',
    
    // Dashboard
    'dashboard.welcomeBack': 'Welcome back',
    'dashboard.welcomeBackSubtitle': 'Ready to win some delicious prizes today?',
    'dashboard.restaurantTitle': 'Restaurant Dashboard',
    'dashboard.restaurantSubtitle': 'Manage QR redemptions and track your earnings',
    'dashboard.currentBalance': 'Current Balance',
    'dashboard.availableBalance': 'Available Balance',
    'dashboard.gamesPlayed': 'Games Played',
    'dashboard.totalWon': 'Total Won',
    'dashboard.winRate': 'Win Rate',
    'dashboard.todayRedemptions': 'Today\'s Redemptions',
    'dashboard.monthlyRevenue': 'Monthly Revenue',
    'dashboard.totalCustomers': 'Total Customers',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.addFunds': 'Add Funds',
    'dashboard.joinGame': 'Join Game',
    'dashboard.scanQR': 'Scan QR Code',
    'dashboard.withdrawFunds': 'Withdraw Funds',
    'dashboard.availableGames': 'Available Games',
    'dashboard.recentGames': 'Recent Games',
    'dashboard.recentRedemptions': 'Recent Redemptions',
    'dashboard.viewAll': 'View All',
    
    // Games
    'games.title': 'Taco Flyer Games',
    'games.subtitle': 'Join a game for $1 and compete for amazing prizes!',
    'games.yourBalance': 'Your Balance',
    'games.insufficientBalance': 'Insufficient Balance',
    'games.insufficientBalanceDesc': 'You need at least $1 to join a game.',
    'games.addFundsNow': 'Add funds now',
    'games.joinGame': 'Join - $1',
    'games.playGame': 'Play Game - $1',
    'games.joining': 'Joining...',
    'games.prize': 'Prize',
    'games.players': 'players',
    'games.endsIn': 'Ends in',
    'games.minScore': 'Min Score',
    'games.howItWorks': 'How Taco Flyer Works',
    'games.step1': '1. Join & Play',
    'games.step1Desc': 'Pay $1 to enter a game. Guide your taco through obstacles by clicking or pressing SPACE.',
    'games.step2': '2. Score Points',
    'games.step2Desc': 'Each obstacle you pass gives you 1 point. Reach the minimum score to qualify for the prize draw.',
    'games.step3': '3. Win Prizes',
    'games.step3Desc': 'Qualified players are entered into a random draw. Winners receive QR codes for restaurant redemption.',
    
    // Free Play
    'freePlay.title': 'Free Taco Flyer',
    'freePlay.subtitle': 'Practice your skills with unlimited free plays!',
    'freePlay.mode': 'Free Play Mode',
    'freePlay.noEntryFee': 'No Entry Fee',
    'freePlay.practiceAndFun': 'Practice & Have Fun!',
    'freePlay.greatJob': 'Great Job!',
    'freePlay.youScored': 'You scored',
    'freePlay.points': 'points!',
    'freePlay.playAgain': 'Play Again',
    'freePlay.otherGames': 'Other Games',
    'freePlay.backToHome': 'Back to Home',
    
    // Hamburger Runner
    'hamburgerRunner.title': 'Hamburger Runner',
    'hamburgerRunner.subtitle': 'Run, jump, and collect coins in this endless adventure!',
    'hamburgerRunner.templeRunStyle': 'Temple Run Style',
    'hamburgerRunner.endlessRunner': 'Endless Runner',
    'hamburgerRunner.collectCoins': 'Collect Coins & Avoid Obstacles!',
    'hamburgerRunner.amazingRun': 'Amazing Run!',
    
    // Game Instructions
    'game.clickOrSpace': 'Click or press SPACE to jump! Avoid obstacles and collect coins for points.',
    'game.clickOrSpaceFlyer': 'Click or press SPACE to make the taco fly! Navigate through the blue pipes.',
    'game.currentScore': 'Current Score',
    'game.score': 'Score',
    'game.distance': 'Distance',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.retry': 'Retry',
    'common.tryAgain': 'Try Again',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Comenzar',
    'nav.dashboard': 'Panel',
    'nav.logout': 'Cerrar Sesión',
    'nav.freePlay': 'JUEGO GRATIS',
    
    // Landing Page
    'landing.title': 'Dollar App',
    'landing.subtitle': 'Paga $1, juega por premios, canjea en restaurantes.',
    'landing.getStarted': 'Comenzar',
    'landing.signIn': 'Iniciar Sesión',
    'landing.freePlay': 'JUEGO GRATIS',
    'landing.howItWorks': 'Cómo Funciona',
    'landing.howItWorksSubtitle': 'Únete a la revolución de juegos gastronómicos con nuestro simple proceso de tres pasos',
    'landing.step1.title': '1. Deposita y Juega',
    'landing.step1.desc': 'Agrega fondos vía Apple Pay, Cash App o Zelle. Entra a juegos por solo $1 cada uno.',
    'landing.step2.title': '2. Gana Premios',
    'landing.step2.desc': 'Compite por pozos de premios crecientes. Los ganadores reciben códigos QR para canjear en restaurantes.',
    'landing.step3.title': '3. Canjea y Disfruta',
    'landing.step3.desc': 'Usa códigos QR en restaurantes participantes. Verificación instantánea y pagos seguros.',
    'landing.cta.title': '¿Listo para Unirte al Juego?',
    'landing.cta.subtitle': 'Comienza a jugar hoy y descubre experiencias gastronómicas increíbles en tu área.',
    'landing.cta.button': 'Crear Cuenta',
    
    // Authentication
    'auth.welcomeBack': 'Bienvenido de vuelta',
    'auth.signInSubtitle': 'Inicia sesión en tu cuenta de Dollar App',
    'auth.createAccount': 'Crear Cuenta',
    'auth.createAccountSubtitle': 'Únete a la comunidad de Dollar App',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.username': 'Nombre de Usuario',
    'auth.accountType': 'Tipo de Cuenta',
    'auth.player': 'Jugador',
    'auth.playerDesc': 'Juega y gana premios',
    'auth.restaurant': 'Restaurante',
    'auth.restaurantDesc': 'Acepta canjes QR',
    'auth.signIn': 'Iniciar Sesión',
    'auth.signUp': 'Crear Cuenta',
    'auth.signingIn': 'Iniciando sesión...',
    'auth.creatingAccount': 'Creando cuenta...',
    'auth.continueWithGoogle': 'Continuar con Google',
    'auth.continueWithApple': 'Continuar con Apple',
    'auth.orContinueWith': 'O continúa con correo',
    'auth.orCreateWith': 'O crea cuenta con correo',
    'auth.alreadyHaveAccount': '¿Ya tienes una cuenta?',
    'auth.dontHaveAccount': '¿No tienes una cuenta?',
    'auth.emailPlaceholder': 'Ingresa tu correo',
    'auth.passwordPlaceholder': 'Ingresa tu contraseña',
    'auth.createPasswordPlaceholder': 'Crea una contraseña',
    'auth.confirmPasswordPlaceholder': 'Confirma tu contraseña',
    'auth.usernamePlaceholder': 'Elige un nombre de usuario',
    'auth.oauthNote': 'Las cuentas OAuth se crean instantáneamente. Las cuentas de correo requieren verificación.',
    
    // Dashboard
    'dashboard.welcomeBack': 'Bienvenido de vuelta',
    'dashboard.welcomeBackSubtitle': '¿Listo para ganar algunos premios deliciosos hoy?',
    'dashboard.restaurantTitle': 'Panel del Restaurante',
    'dashboard.restaurantSubtitle': 'Gestiona canjes QR y rastrea tus ganancias',
    'dashboard.currentBalance': 'Saldo Actual',
    'dashboard.availableBalance': 'Saldo Disponible',
    'dashboard.gamesPlayed': 'Juegos Jugados',
    'dashboard.totalWon': 'Total Ganado',
    'dashboard.winRate': 'Tasa de Victoria',
    'dashboard.todayRedemptions': 'Canjes de Hoy',
    'dashboard.monthlyRevenue': 'Ingresos Mensuales',
    'dashboard.totalCustomers': 'Total de Clientes',
    'dashboard.quickActions': 'Acciones Rápidas',
    'dashboard.addFunds': 'Agregar Fondos',
    'dashboard.joinGame': 'Unirse al Juego',
    'dashboard.scanQR': 'Escanear Código QR',
    'dashboard.withdrawFunds': 'Retirar Fondos',
    'dashboard.availableGames': 'Juegos Disponibles',
    'dashboard.recentGames': 'Juegos Recientes',
    'dashboard.recentRedemptions': 'Canjes Recientes',
    'dashboard.viewAll': 'Ver Todo',
    
    // Games
    'games.title': 'Juegos Taco Flyer',
    'games.subtitle': '¡Únete a un juego por $1 y compite por premios increíbles!',
    'games.yourBalance': 'Tu Saldo',
    'games.insufficientBalance': 'Saldo Insuficiente',
    'games.insufficientBalanceDesc': 'Necesitas al menos $1 para unirte a un juego.',
    'games.addFundsNow': 'Agregar fondos ahora',
    'games.joinGame': 'Unirse - $1',
    'games.playGame': 'Jugar - $1',
    'games.joining': 'Uniéndose...',
    'games.prize': 'Premio',
    'games.players': 'jugadores',
    'games.endsIn': 'Termina en',
    'games.minScore': 'Puntuación Mín',
    'games.howItWorks': 'Cómo Funciona Taco Flyer',
    'games.step1': '1. Únete y Juega',
    'games.step1Desc': 'Paga $1 para entrar a un juego. Guía tu taco a través de obstáculos haciendo clic o presionando ESPACIO.',
    'games.step2': '2. Anota Puntos',
    'games.step2Desc': 'Cada obstáculo que pases te da 1 punto. Alcanza la puntuación mínima para calificar al sorteo de premios.',
    'games.step3': '3. Gana Premios',
    'games.step3Desc': 'Los jugadores calificados entran en un sorteo aleatorio. Los ganadores reciben códigos QR para canjear en restaurantes.',
    
    // Free Play
    'freePlay.title': 'Taco Flyer Gratis',
    'freePlay.subtitle': '¡Practica tus habilidades con juegos gratis ilimitados!',
    'freePlay.mode': 'Modo Juego Gratis',
    'freePlay.noEntryFee': 'Sin Costo de Entrada',
    'freePlay.practiceAndFun': '¡Practica y Diviértete!',
    'freePlay.greatJob': '¡Excelente Trabajo!',
    'freePlay.youScored': 'Anotaste',
    'freePlay.points': 'puntos!',
    'freePlay.playAgain': 'Jugar de Nuevo',
    'freePlay.otherGames': 'Otros Juegos',
    'freePlay.backToHome': 'Volver al Inicio',
    
    // Hamburger Runner
    'hamburgerRunner.title': 'Corredor de Hamburguesas',
    'hamburgerRunner.subtitle': '¡Corre, salta y recolecta monedas en esta aventura sin fin!',
    'hamburgerRunner.templeRunStyle': 'Estilo Temple Run',
    'hamburgerRunner.endlessRunner': 'Corredor Sin Fin',
    'hamburgerRunner.collectCoins': '¡Recolecta Monedas y Evita Obstáculos!',
    'hamburgerRunner.amazingRun': '¡Carrera Increíble!',
    
    // Game Instructions
    'game.clickOrSpace': '¡Haz clic o presiona ESPACIO para saltar! Evita obstáculos y recolecta monedas por puntos.',
    'game.clickOrSpaceFlyer': '¡Haz clic o presiona ESPACIO para hacer volar el taco! Navega a través de las tuberías azules.',
    'game.currentScore': 'Puntuación Actual',
    'game.score': 'Puntuación',
    'game.distance': 'Distancia',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.close': 'Cerrar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.submit': 'Enviar',
    'common.retry': 'Reintentar',
    'common.tryAgain': 'Intentar de Nuevo',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get saved language from localStorage or default to English
    const saved = localStorage.getItem('dollarapp-language');
    return (saved as Language) || 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('dollarapp-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};