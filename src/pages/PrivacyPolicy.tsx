import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link 
            to="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">Privacy Policy</h1>
            <p className="text-gray-600">How we protect and handle your information</p>
          </div>
        </div>

        {/* Content */}
        <div className="food-card p-8">
          <div className="text-gray-700 space-y-6 leading-relaxed">
            <p className="text-lg font-medium">
              By accessing or using the Platform, you agree to this Privacy Policy.
            </p>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">1. Information We Collect</h2>
              
              <div className="ml-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">a. Information You Provide</h3>
                  <ul className="ml-4 space-y-2">
                    <li><strong>Account Info:</strong> Name, email, Google/Apple ID, password hash</li>
                    <li><strong>KYC Data (if required):</strong> Legal name, date of birth, address, photo ID, selfie</li>
                    <li><strong>Game Activity:</strong> Gameplay stats, entry fees, wins/losses</li>
                    <li><strong>Redemption Info:</strong> QR codes, redemption timestamps, local business locations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">b. Payment & Wallet Info</h3>
                  <ul className="ml-4 space-y-2">
                    <li>Dollar App processes payments via Stripe, Coinbase Commerce, or similar services</li>
                    <li>We do not store full credit card numbers</li>
                    <li>For USDC users: we store Solana wallet public keys and related transaction metadata</li>
                    <li>Wallets may be encrypted with AWS KMS and user PINs</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">c. Device & Usage Info</h3>
                  <ul className="ml-4 space-y-2">
                    <li>IP address, browser type, operating system</li>
                    <li>Pages visited, game sessions, referral source</li>
                    <li>Crash reports and technical diagnostics</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">2. How We Use Your Information</h2>
              <p className="mb-2">We use your information to:</p>
              <ul className="ml-4 space-y-2">
                <li>Create and manage your account</li>
                <li>Enable gameplay, tournaments, and prize redemptions</li>
                <li>Process payments and blockchain transactions</li>
                <li>Prevent fraud, abuse, and duplicate accounts</li>
                <li>Verify identity (for regulatory and prize integrity)</li>
                <li>Improve game quality and customer experience</li>
                <li>Communicate with you (e.g., emails, receipts, QR codes)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">3. How We Share Your Information</h2>
              <p className="mb-2">We do not sell your data. We may share information with:</p>
              <ul className="ml-4 space-y-2">
                <li><strong>Local Businesses:</strong> When you redeem a prize, we provide them your redemption details (e.g., QR code ID, item won, time of redemption)</li>
                <li><strong>Payment Processors:</strong> Stripe, Coinbase, Solana, etc.</li>
                <li><strong>Identity Verification Vendors:</strong> Such as Persona, if KYC is required</li>
                <li><strong>Cloud Providers:</strong> For secure storage and processing (e.g., AWS)</li>
                <li><strong>Legal/Regulatory:</strong> If required by law, court order, or to protect against fraud</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">4. Data Storage & Security</h2>
              <p className="mb-2">We use AES-256 encryption, AWS KMS, and industry-standard security practices to protect your data.</p>
              <ul className="ml-4 space-y-2">
                <li>Wallet keys are encrypted and tied to user credentials</li>
                <li>Sensitive KYC documents are handled through secure third-party APIs</li>
                <li>Access to user data is limited to essential personnel</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">5. Your Rights</h2>
              <p className="mb-2">You may:</p>
              <ul className="ml-4 space-y-2">
                <li>Request access to your data</li>
                <li>Correct inaccurate information</li>
                <li>Request account deletion</li>
                <li>Opt out of marketing emails at any time</li>
              </ul>
              <p className="mt-2">To exercise any of these rights, contact <a href="mailto:support@dollarfood.app" className="text-primary-600 hover:text-primary-700 underline">support@dollarfood.app</a>.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">6. Cookies & Tracking</h2>
              <p className="mb-2">We use cookies and similar technologies to:</p>
              <ul className="ml-4 space-y-2">
                <li>Keep you signed in</li>
                <li>Track game engagement and performance</li>
                <li>Analyze site usage for improvements</li>
                <li>Serve localized local business content</li>
              </ul>
              <p className="mt-2">You can disable cookies in your browser, but some features may not work correctly.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">7. Children's Privacy</h2>
              <p>Dollar App is not intended for users under 18 years old. We do not knowingly collect data from minors. If we discover such data has been collected, we will delete it promptly.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">8. Data Retention</h2>
              <p>We retain data as long as your account is active or as needed to comply with legal or tax obligations.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">9. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. Changes will be posted here and may be emailed to you. Continued use of the Platform indicates acceptance of the updated policy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;