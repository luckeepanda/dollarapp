import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Landing page
    'landing.title': 'Dollar App',
    'landing.subtitle': 'Pay $1, play for prizes, redeem at restaurants.',
    'landing.getStarted': 'GET STARTED',
    'landing.playFreeNow': 'PLAY FREE NOW',
    'landing.forRestaurants': 'For Restaurants',
    'landing.howItWorks': 'How It Works',
    'landing.howItWorksSubtitle': 'Join the food game revolution with our simple three-step process',
    'landing.step1.title': '1. Deposit & Play',
    'landing.step1.description': 'Add funds instantly. Enter games for just $1 each.',
    'landing.step2.title': '2. Win Prizes',
    'landing.step2.description': 'Compete for amazing food prizes.',
    'landing.step3.title': '3. Redeem & Enjoy',
    'landing.step3.description': 'Use QR codes at restaurants. Instant verification.',
    'landing.cta.title': 'Ready to Join the Game?',
    'landing.cta.subtitle': 'Start playing today and discover amazing food experiences in your area.',
    'landing.cta.button': 'Create Account',
    'language.english': 'English',
    'language.spanish': 'Español'
  },
  es: {
    // Landing page
    'landing.title': 'Dollar App',
    'landing.subtitle': 'Paga $1, juega por premios, canjea en restaurantes.',
    'landing.getStarted': 'COMENZAR',
    'landing.playFreeNow': 'JUGAR GRATIS AHORA',
    'landing.forRestaurants': 'Para Restaurantes',
    'landing.howItWorks': 'Cómo Funciona',
    'landing.howItWorksSubtitle': 'Únete a la revolución de juegos gastronómicos con nuestro simple proceso de tres pasos',
    'landing.step1.title': '1. Deposita y Juega',
    'landing.step1.description': 'Agrega fondos al instante. Entra a juegos por solo $1 cada uno.',
    'landing.step2.title': '2. Gana Premios',
    'landing.step2.description': 'Compite por increíbles premios gastronómicos.',
    'landing.step3.title': '3. Canjea y Disfruta',
    'landing.step3.description': 'Usa códigos QR en restaurantes. Verificación instantánea.',
    'landing.cta.title': '¿Listo para Unirte al Juego?',
    'landing.cta.subtitle': 'Comienza a jugar hoy y descubre increíbles experiencias gastronómicas en tu área.',
    'landing.cta.button': 'Crear Cuenta',
    'language.english': 'English',
    'language.spanish': 'Español'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};