import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Zap, CreditCard, TrendingUp, Star, Info, Sparkles } from 'lucide-react';

const Pricing: React.FC = () => {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const plans = [
    {
      id: 1,
      name: 'Starter',
      price: '$9.99',
      period: '/one time',
      description: 'Perfect for casual players',
      features: ['$1 Games'],
      cta: 'Get Started',
      highlight: false,
      color: 'from-success-500 to-success-600'
    },
    {
      id: 2,
      name: 'Pro',
      price: '$19.99',
      period: '/one time',
      description: 'Most popular choice',
      features: ['$1 Games', 'Crypto Payment'],
      cta: 'Choose Plan',
      highlight: true,
      color: 'from-primary-500 to-primary-600'
    },
    {
      id: 3,
      name: 'Premium',
      price: '$49.99',
      period: '/one time',
      description: 'For serious gamers',
      features: ['$1 Games', 'Crypto Payment', 'SEO'],
      cta: 'Scale Up',
      highlight: false,
      color: 'from-accent-500 to-accent-600'
    }
  ];

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case '$1 Games':
        return <Zap className="h-4 w-4" />;
      case 'Crypto Payment':
        return <CreditCard className="h-4 w-4" />;
      case 'SEO':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };

  const getFeatureColor = (feature: string) => {
    switch (feature) {
      case '$1 Games':
        return 'bg-success-100 text-success-800';
      case 'Crypto Payment':
        return 'bg-primary-100 text-primary-800';
      case 'SEO':
        return 'bg-accent-100 text-accent-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="flex items-center space-x-4 p-6">
        <Link 
          to="/"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Pricing</h1>
          <p className="text-gray-600">Choose the perfect plan for your gaming needs</p>
        </div>
      </div>

      {/* Claw Machine Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100 py-16 food-grid">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Web3-inspired title with enhanced styling */}
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-6">
            What is <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">Dollar App</span>?
          </h2>
          
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-green-400/20 blur-xl"></div>
            <p className="relative text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              Digital Arcade Machine for your business
            </p>
          </div>

          {/* Interactive 3D Claw Machine */}
          <div className="relative mx-auto max-w-3xl mb-8">
            {/* Arcade-Style Claw Machine Illustration */}
            <div className="food-card p-8 relative overflow-hidden">
              <svg 
                viewBox="0 0 500 400" 
                className="w-full h-96 mx-auto"
                role="img"
                aria-label="Colorful Japanese anime-inspired claw machine with food plushies"
              >
                {/* Machine Base with Gradient */}
                <defs>
                  <linearGradient id="baseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFC107"/>
                    <stop offset="50%" stopColor="#FFD54F"/>
                    <stop offset="100%" stopColor="#FF8F00"/>
                  </linearGradient>
                  <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(76,175,80,0.1)"/>
                    <stop offset="50%" stopColor="rgba(255,193,7,0.05)"/>
                    <stop offset="100%" stopColor="rgba(76,175,80,0.1)"/>
                  </linearGradient>
                  <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4CAF50"/>
                    <stop offset="50%" stopColor="#8BC34A"/>
                    <stop offset="100%" stopColor="#CDDC39"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Machine Base */}
                <rect x="25" y="80" width="450" height="300" rx="25" fill="url(#baseGrad)" stroke="#FF8F00" strokeWidth="3"/>
                
                {/* Glass Cabinet */}
                <rect x="45" y="100" width="410" height="240" rx="20" fill="url(#glassGrad)" stroke="#4CAF50" strokeWidth="2" opacity="0.8"/>
                
                {/* Machine Top with Neon Effect */}
                <rect x="15" y="20" width="470" height="70" rx="35" fill="url(#topGrad)" filter="url(#glow)"/>
                <text x="250" y="60" textAnchor="middle" fontSize="18" fill="white" fontWeight="bold">🎮 DOLLAR ARCADE 🎮</text>
                
                {/* Claw Rail */}
                <rect x="60" y="30" width="380" height="8" rx="4" fill="#FF6B35"/>
                
                {/* Animated Claw - More Aggressive Movement */}
                <g className="animate-float">
                  {/* Claw Cable */}
                  <rect x="248" y="38" width="4" height="120" fill="#666"/>
                  
                  {/* Claw Head */}
                  <circle cx="250" cy="165" r="15" fill="#FF6B35" stroke="#FF8F00" strokeWidth="2"/>
                  
                  {/* Claw Arms - More Extended */}
                  <path d="M 235 170 L 225 190 L 235 200" stroke="#FF6B35" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <path d="M 250 170 L 250 200" stroke="#FF6B35" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <path d="M 265 170 L 275 190 L 265 200" stroke="#FF6B35" strokeWidth="4" fill="none" strokeLinecap="round"/>
                </g>
                
                {/* Cute Food Plushies with $1 Labels */}
                <g className="animate-pulse">
                  {/* Pizza Plushie */}
                  <circle cx="120" cy="250" r="30" fill="#FF5722"/>
                  <circle cx="120" cy="250" r="25" fill="#FFD54F"/>
                  <circle cx="115" cy="245" r="3" fill="#FF1744"/>
                  <circle cx="125" cy="255" r="3" fill="#4CAF50"/>
                  <text x="120" y="260" textAnchor="middle" fontSize="24">🍕</text>
                  <text x="120" y="220" textAnchor="middle" fontSize="20" fill="#FFD700" fontWeight="bold">$1</text>
                  
                  {/* Taco Plushie */}
                  <ellipse cx="250" cy="270" rx="28" ry="22" fill="#8BC34A"/>
                  <ellipse cx="250" cy="270" rx="23" ry="18" fill="#CDDC39"/>
                  <text x="250" y="280" textAnchor="middle" fontSize="24">🌮</text>
                  <text x="250" y="240" textAnchor="middle" fontSize="20" fill="#FFD700" fontWeight="bold">$1</text>
                  
                  {/* Hamburger Plushie */}
                  <circle cx="380" cy="240" r="30" fill="#FF8F00"/>
                  <circle cx="380" cy="240" r="25" fill="#FFD54F"/>
                  <circle cx="375" cy="235" r="2" fill="#FF1744"/>
                  <circle cx="385" cy="245" r="2" fill="#4CAF50"/>
                  <text x="380" y="250" textAnchor="middle" fontSize="24">🍔</text>
                  <text x="380" y="210" textAnchor="middle" fontSize="20" fill="#FFD700" fontWeight="bold">$1</text>
                  
                  {/* French Fries Plushie */}
                  <rect x="140" y="300" width="40" height="30" rx="15" fill="#FFD54F"/>
                  <text x="160" y="325" textAnchor="middle" fontSize="24">🍟</text>
                  <text x="160" y="295" textAnchor="middle" fontSize="20" fill="#FFD700" fontWeight="bold">$1</text>
                  
                  {/* Ice Cream Plushie */}
                  <circle cx="320" cy="310" r="25" fill="#E1BEE7"/>
                  <text x="320" y="320" textAnchor="middle" fontSize="24">🍦</text>
                  <text x="320" y="285" textAnchor="middle" fontSize="20" fill="#FFD700" fontWeight="bold">$1</text>
                  
                  {/* Donut Plushie */}
                  <circle cx="180" cy="180" r="25" fill="#D2691E"/>
                  <circle cx="180" cy="180" r="15" fill="#8B4513"/>
                  <text x="180" y="190" textAnchor="middle" fontSize="24">🍩</text>
                  <text x="180" y="155" textAnchor="middle" fontSize="20" fill="#FFD700" fontWeight="bold">$1</text>
                </g>
                
                {/* Control Panel */}
                <rect x="400" y="140" width="60" height="100" rx="10" fill="#E91E63"/>
                <circle cx="430" cy="160" r="10" fill="#FFC107"/>
                <rect x="420" y="180" width="20" height="15" rx="3" fill="#4CAF50"/>
                <rect x="420" y="200" width="20" height="8" rx="2" fill="#FF6B35"/>
                
                {/* Coin Slot */}
                <rect x="425" y="120" width="20" height="4" rx="2" fill="#000"/>
                <text x="435" y="135" textAnchor="middle" fontSize="8" fill="#666">💰</text>
                
                {/* Neon Highlights */}
                <rect x="25" y="80" width="450" height="4" rx="2" fill="#4CAF50" opacity="0.8" filter="url(#glow)"/>
                <rect x="25" y="376" width="450" height="4" rx="2" fill="#FFC107" opacity="0.8" filter="url(#glow)"/>
              </svg>
              
              {/* Floating UI Elements - Removed pink star and purple thunder */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-xl shadow-lg animate-bounce delay-500">
                <Zap className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          {/* Interaction hint */}
          <div className="bg-gradient-to-r from-yellow-50 to-green-50 p-4 rounded-2xl border border-yellow-200 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Arcade-style gaming platform for restaurants!</span>
              <Zap className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="py-16 bg-white relative">
        <div className="absolute inset-0 food-grid opacity-20"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative food-card rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 h-full flex flex-col ${
                  plan.highlight 
                    ? 'ring-4 ring-primary-200 shadow-2xl pt-8' 
                    : 'hover:shadow-xl'
                } ${
                  hoveredPlan === plan.id ? 'shadow-2xl' : ''
                }`}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Highlight Badge */}
                {plan.highlight && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      <Star className="h-4 w-4 inline mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white relative overflow-hidden`}>
                  {/* Animated background shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm opacity-90 mb-4">{plan.description}</p>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className="text-lg opacity-75 ml-1">/one time</span>
                    </div>
                  </div>
                </div>

                {/* Plan Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Features */}
                  <div className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="group relative">
                        <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${getFeatureColor(feature)} group-hover:scale-105`}>
                          {getFeatureIcon(feature)}
                          <span>{feature}</span>
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap transition-opacity duration-300 pointer-events-none z-20">
                            {feature === '$1 Games' && 'Play skill-based games for just $1'}
                            {feature === 'Crypto Payment' && 'Pay with USDC cryptocurrency'}
                            {feature === 'SEO' && 'Enhanced search visibility'}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mt-auto ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  {/* Additional Info */}
                  <div className="mt-4 text-center flex-shrink-0">
                    <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
                      <Info className="h-3 w-3" />
                      <span>Cancel anytime • No hidden fees</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info Section */}
          <div className="mt-16 text-center">
            <div className="food-card p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-display">
                All Plans Include
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="bg-success-100 p-2 rounded-lg">
                    <Check className="h-5 w-5 text-success-600" />
                  </div>
                  <span>Real food prizes at local restaurants</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <Check className="h-5 w-5 text-primary-600" />
                  </div>
                  <span>QR code redemption system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-accent-100 p-2 rounded-lg">
                    <Check className="h-5 w-5 text-accent-600" />
                  </div>
                  <span>Mobile-optimized gameplay</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center font-display">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="food-card p-6">
                <h4 className="font-semibold text-gray-900 mb-2">How do $1 games work?</h4>
                <p className="text-gray-600 text-sm">
                  Pay $1 to enter skill-based games. Win prizes that can be redeemed at local restaurants using QR codes.
                </p>
              </div>
              <div className="food-card p-6">
                <h4 className="font-semibold text-gray-900 mb-2">What is crypto payment?</h4>
                <p className="text-gray-600 text-sm">
                  Pay with USDC cryptocurrency on Solana network. All payments settle as USD in your account.
                </p>
              </div>
              <div className="food-card p-6">
                <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
                <p className="text-gray-600 text-sm">
                  Yes! All plans can be canceled at any time with no cancellation fees or penalties.
                </p>
              </div>
              <div className="food-card p-6">
                <h4 className="font-semibold text-gray-900 mb-2">How do I redeem prizes?</h4>
                <p className="text-gray-600 text-sm">
                  Winners receive QR codes via email. Present the code at participating restaurants to claim your prize.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-primary-500 to-success-500 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4 font-display">
            Ready to Start Playing?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of players winning real food prizes every day!
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-primary-200"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;