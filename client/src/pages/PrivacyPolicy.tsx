import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-10 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: March 15, 2026</p>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">1. Overview</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Red Boot's Spelling Adventure ("the App") is a children's educational spelling game designed
              for use by children under the supervision of a parent or guardian. We are committed to
              protecting the privacy of our users, especially children. This policy explains what
              information the App collects, how it is used, and your rights regarding that information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">2. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The App may collect and store the following information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-1">
              <li>Parent email address (used for account creation and communication)</li>
              <li>Child's first name (optional, used for personalized greetings)</li>
              <li>Grade level (optional, to tailor the learning experience)</li>
              <li>Spelling word lists entered or captured via photo</li>
              <li>Practice session scores and learning progress</li>
              <li>Achievements, badges, and treasure counts</li>
              <li>Audio and display preferences</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Most data is stored locally on your device. If you create an account, your email
              address is stored securely on our servers to enable account management and data syncing.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">3. How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The information collected is used solely to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-1">
              <li>Provide personalized spelling practice and feedback</li>
              <li>Track learning progress and display it to parents</li>
              <li>Award achievements and treasures based on practice performance</li>
              <li>Remember user preferences between sessions</li>
              <li>Enable account management and parent communication via email</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">4. Payments</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              All purchases and subscriptions are processed entirely through the Apple App Store or
              Google Play Store. We do not collect, store, or have access to any payment information
              such as credit card numbers or billing details. Please refer to
              Apple's or Google's privacy policies for information about how they handle payment data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">5. Children's Privacy</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              The App is designed for use by children under parent or guardian supervision.
              We do not knowingly collect personal information from children beyond what is described
              in this policy. The child's first name is optional and is only used locally on the device
              to personalize the in-app experience. We do not sell, share, or transmit children's
              data to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">6. Data Sharing</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We do not sell, rent, or share your personal information with third parties. Your data
              stays on your device. We do not use advertising networks or analytics services that
              track children.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">7. Data Storage & Security</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              All app data is stored locally on your device using standard browser or app storage.
              Clearing the app's data or uninstalling the app will permanently remove all stored
              information. We recommend parents periodically review the data stored within the app.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">8. Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-1">
              <li>View all data the App has stored (accessible within the app's parent dashboard)</li>
              <li>Delete all stored data at any time by clearing the app data or using the "Clear Words" option in settings</li>
              <li>Request information about what data is stored by contacting us</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">9. Changes to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be reflected
              within the app with an updated "Last updated" date. Continued use of the App after
              changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">10. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have questions about this Privacy Policy or wish to request data deletion,
              please contact us at:
            </p>
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              Email: empire813transport@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
