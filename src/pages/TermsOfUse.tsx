import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfUse: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 font-display">Terms of Use</h1>
            <p className="text-gray-600">Terms and conditions for using Dollar App</p>
          </div>
        </div>

        {/* Content */}
        <div className="food-card p-8">
          <div className="text-gray-700 space-y-6 leading-relaxed">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">1. Eligibility</h2>
              <p>You must be at least 18 years old and a legal resident of the United States to use Dollar App. By registering, you confirm that all information you provide is accurate and complete.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">2. Game Overview</h2>
              <p className="mb-2">Dollar App hosts tournament-style, skill-based games where users pay a fixed entry fee (typically $1) to compete. Winners receive digital food vouchers redeemable at participating restaurants.</p>
              <ul className="ml-4 space-y-2">
                <li>• No purchase is necessary to observe or test games (Free Play)</li>
                <li>• Real gameplay requires payment of the entry fee</li>
                <li>• Winners are determined based on skill performance (e.g., reaction time, accuracy, score)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">3. Payments & USDC</h2>
              <p className="mb-2">Dollar App accepts fiat (USD) and USDC on the Solana network for payments and prize disbursement.</p>
              <ul className="ml-4 space-y-2">
                <li>• Players may fund accounts using Stripe, Coinbase Commerce, or other supported methods</li>
                <li>• Winnings are issued in the form of restaurant redemption vouchers, not cash payouts</li>
                <li>• Restaurant partners receive payments in USDC or USD equivalent at time of redemption</li>
                <li>• All transactions are final. No refunds once a game starts.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">4. Redemption Process</h2>
              <p className="mb-2">Winning players receive a unique QR code via email. To redeem:</p>
              <ul className="ml-4 space-y-2">
                <li>• Visit the participating restaurant listed in the game</li>
                <li>• Show the QR code at checkout</li>
                <li>• The restaurant scans the code and fulfills the prize</li>
                <li>• Dollar App handles payment directly to the restaurant (110% of food cost)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">5. Restaurant Participation</h2>
              <p className="mb-2">Restaurants agree to:</p>
              <ul className="ml-4 space-y-2">
                <li>• Honor valid QR code redemptions</li>
                <li>• Serve the designated item promptly</li>
                <li>• Receive payment in USDC or USD minus platform fees (if any)</li>
              </ul>
              <p className="mt-2">Dollar App is not responsible for restaurant delays, closures, or menu substitutions.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">6. Prohibited Conduct</h2>
              <p className="mb-2">You may not:</p>
              <ul className="ml-4 space-y-2">
                <li>• Use bots, exploits, or any method to gain unfair advantage</li>
                <li>• Misuse or replicate QR codes</li>
                <li>• Attempt to defraud or impersonate another user</li>
                <li>• Violate any law while using the Platform</li>
              </ul>
              <p className="mt-2">Violating these terms may result in account suspension, forfeiture of rewards, or legal action.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">7. Account & Security</h2>
              <p>You are responsible for safeguarding your login credentials and any wallet keys or QR codes issued. Dollar App is not liable for lost access due to user error, lost devices, or compromised credentials.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">8. KYC & Compliance</h2>
              <p>We may require identity verification for high-volume players or payouts, using third-party services like Persona. By using the Platform, you consent to such procedures in compliance with applicable laws and anti-fraud regulations.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">9. Intellectual Property</h2>
              <p>All content on the Platform — including branding, UI/UX, games, and logic — is owned by Gametable Technologies LLC. You may not copy, distribute, reverse-engineer, or reuse any part of the Platform without written permission.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">10. Disclaimers & Limitation of Liability</h2>
              <ul className="ml-4 space-y-2">
                <li>• Dollar App is provided "as-is" and we do not guarantee uninterrupted or error-free access</li>
                <li>• We are not responsible for delays, lost redemptions, or technical errors caused by third parties (e.g., Solana, Stripe, email providers, restaurants)</li>
                <li>• Our total liability is limited to the amount you paid us in the past 30 days</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">11. Termination</h2>
              <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms or suspicion of fraud. You may also close your account at any time by contacting support.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">12. Dispute Resolution</h2>
              <p>You agree to resolve any dispute through binding arbitration in the state of Georgia. Class actions and jury trials are waived to the extent permitted by law.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">13. Governing Law</h2>
              <p>These Terms are governed by the laws of the State of Georgia, without regard to conflict of laws principles.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">14. Modifications</h2>
              <p>We may modify these Terms at any time. If we do, we'll notify you via the Platform or email. Continued use after changes means you accept the updated Terms.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;