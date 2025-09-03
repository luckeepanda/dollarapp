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
            <span className="text-success-600">What is </span><span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">Dollar App</span><span className="text-success-600">?</span>
          </h2>
          
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-green-400/20 blur-xl"></div>
            <p className="relative text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              Digital Arcade Machine for your business
            </p>
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
                className={`relative food-card rounded-2xl overflow-hidden transition-all duration-300 transform hover:scale-105 h-full flex flex-col min-h-[400px] ${
                  plan.highlight 
                    ? 'ring-4 ring-primary-200 shadow-2xl' 
                    : 'hover:shadow-xl'
                } ${
                  hoveredPlan === plan.id ? 'shadow-2xl' : ''
                }`}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
              >

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