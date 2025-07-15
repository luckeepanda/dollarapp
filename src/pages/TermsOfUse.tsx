import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfUse: React.FC = () => {
+  return (
+    <div className="min-h-screen bg-gradient-to-br from-steel-blue-900 to-royal-blue-900">
+      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
+        {/* Header */}
+        <div className="flex items-center space-x-4 mb-8">
+          <Link 
+            to="/"
+            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
+          >
+            <ArrowLeft className="h-5 w-5 text-steel-blue" />
+          </Link>
+          <div>
+            <h1 className="text-3xl font-bold text-steel-blue">Terms of Use</h1>
+            <p className="text-royal-blue-200">Terms and conditions for using Dollar App</p>
+          </div>
+        </div>

+        {/* Content */}
+        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
+          <div className="text-steel-blue-200 space-y-6">
+            <p className="text-lg">
+              This Terms of Use page is currently under construction.
+            </p>
+            <p>
+              We are working on finalizing our terms and conditions and will update this page soon.
+            </p>
+            <p>
+              If you have any questions about our terms of service, please contact us.
+            </p>
+          </div>
+        </div>
+      </div>
+    </div>
+  );
+};
+
+export default TermsOfUse;