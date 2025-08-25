import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Zap, CreditCard, TrendingUp, Star, Info } from 'lucide-react';

const Pricing: React.FC = () => {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
      period: '/month',
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
      period: '/month',
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
      period: '/month',
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
      <div className="relative overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100 py-16">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-success-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-success-400/20 to-accent-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold font-display food-text-gradient mb-6">
            Choose Your Gaming Plan
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Start playing skill-based games and winning real food prizes today!
          </p>

          {/* Claw Machine Animation */}
          <div className="relative mx-auto max-w-lg mb-8">
            <div className="food-card p-8 relative overflow-hidden">
              {/* Claw Machine SVG Animation */}
              <svg 
                viewBox="0 0 400 300" 
                className="w-full h-64 mx-auto"
                role="img"
                aria-label="Animated claw machine trying to grab food plushies"
              >
                {/* Machine Frame */}
                <rect x="20" y="40" width="360" height="220" rx="20" fill="#4B5563" stroke="#374151" strokeWidth="3"/>
                <rect x="30" y="50" width="340" height="200" rx="15" fill="#F3F4F6"/>
                
                {/* Glass Front */}
                <rect x="35" y="55" width="330" height="190" rx="10" fill="rgba(255,255,255,0.3)" stroke="#E5E7EB" strokeWidth="2"/>
                
                {/* Food Plushies */}
                <g className={prefersReducedMotion ? '' : 'animate-pulse'}>
                  {/* Pizza Plushie */}
                  <circle cx="100" cy="200" r="25" fill="#FF6B35"/>
                  <text x="100" y="208" textAnchor="middle" fontSize="24">🍕</text>
                  
                  {/* Taco Plushie */}
                  <circle cx="200" cy="180" r="25" fill="#22C55E"/>
                  <text x="200" y="188" textAnchor="middle" fontSize="24">🌮</text>
                  
                  {/* Hamburger Plushie */}
                  <circle cx="300" cy="210" r="25" fill="#FBBF24"/>
                  <text x="300" y="218" textAnchor="middle" fontSize="24">🍔</text>
                </g>
                
                {/* Claw Mechanism */}
                <g className={prefersReducedMotion ? '' : 'animate-float'}>
                  {/* Claw Rail */}
                  <rect x="50" y="20" width="300" height="8" rx="4" fill="#6B7280"/>
                  
                  {/* Claw Arm */}
                  <rect x="195" y="28" width="10" height="80" fill="#374151"/>
                  
                  {/* Claw */}
                  <g transform="translate(200, 108)">
                    <circle r="12" fill="#9CA3AF"/>
                    <path d="M-8,-8 L0,8 L8,-8" stroke="#374151" strokeWidth="3" fill="none"/>
                  </g>
                </g>
                
                {/* Machine Top */}
                <rect x="10" y="10" width="380" height="40" rx="20" fill="#EF4444"/>
                <text x="200" y="35" textAnchor="middle" fontSize="18" fill="white" fontWeight="bold">DOLLAR ARCADE</text>
                
                {/* Coin Slot */}
                <rect x="350" y="15" width="30" height="6" rx="3" fill="#374151"/>
                <text x="365" y="45" textAnchor="middle" fontSize="8" fill="#6B7280">$1</text>
              </svg>
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
                className={`relative food-card rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                  plan.highlight 
                    ? 'ring-4 ring-primary-200 shadow-2xl' 
                    : 'hover:shadow-xl'
                } ${
                  hoveredPlan === plan.id ? 'shadow-2xl' : ''
                }`}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {/* Highlight Badge */}
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
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
                      <span className="text-lg opacity-75 ml-1">{plan.period}</span>
                    </div>
                  </div>
                </div>

                {/* Plan Content */}
                <div className="p-6">
                  {/* Features */}
                  <div className="space-y-3 mb-8">
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
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  {/* Additional Info */}
                  <div className="mt-4 text-center">
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