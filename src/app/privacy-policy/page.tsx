import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | The California Pickle",
  description: "Privacy Policy for The California Pickle LLC.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic text-black mb-2">
            Privacy <span className="text-[#a3e635]">Policy</span>
          </h1>
          <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-12">
            Last updated: March 17, 2026
          </p>

          <div className="space-y-10 text-black/80 text-sm font-medium leading-relaxed">

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">1. Who We Are</h2>
              <p>
                The California Pickle LLC ("we," "us," or "our") operates the website{" "}
                <span className="font-black">thecaliforniapickle.com</span> and sells sports performance products
                including electrolyte pickle brine shots. Our principal place of business is located at
                1999 Harrison Street, Suite 1800, Oakland, CA 94612.
              </p>
              <p className="mt-3">
                For privacy-related inquiries, contact us at:{" "}
                <span className="font-black">hello@thecaliforniapickle.com</span>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">2. Information We Collect</h2>
              <p className="mb-3">When you place an order or interact with our website, we may collect:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="font-black text-black">Identity & Contact:</span> First name, last name, email address, phone number (if provided).</li>
                <li><span className="font-black text-black">Shipping Information:</span> Delivery address, city, state, zip code, and country.</li>
                <li><span className="font-black text-black">Payment Information:</span> We do not store your payment card details. All payment processing is handled securely by <span className="font-black">Stripe, Inc.</span> under their own privacy policy. We only receive a transaction confirmation and order amount.</li>
                <li><span className="font-black text-black">Order Data:</span> Products purchased, quantities, pricing, discount codes applied, and shipping method selected.</li>
                <li><span className="font-black text-black">Usage Data:</span> IP address, browser type, pages visited, and time spent on our site — collected automatically via standard web server logs.</li>
                <li><span className="font-black text-black">Communications:</span> Any emails or messages you send us.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Process and fulfill your orders, including shipping and delivery.</li>
                <li>Send transactional emails — order confirmations, shipping notifications, and tracking updates.</li>
                <li>Respond to customer service inquiries.</li>
                <li>Send promotional emails if you have opted in. You may opt out at any time via the unsubscribe link in any email.</li>
                <li>Detect and prevent fraudulent transactions.</li>
                <li>Comply with legal obligations under applicable U.S. law.</li>
                <li>Improve our website, products, and services based on aggregate usage patterns.</li>
              </ul>
              <p className="mt-3">
                We do <span className="font-black text-black">not</span> sell, rent, or trade your personal
                information to third parties for their marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">4. How We Share Your Information</h2>
              <p className="mb-3">We share your information only with trusted service providers necessary to operate our business:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="font-black text-black">Stripe, Inc.</span> — Payment processing. Stripe is PCI-DSS compliant.</li>
                <li><span className="font-black text-black">Shippo / Shipping Carriers</span> — Your name and shipping address are shared with our shipping carrier (e.g., USPS, UPS, FedEx) to fulfill delivery.</li>
                <li><span className="font-black text-black">Email Service Provider</span> — We use ZeptoMail to deliver transactional emails. Your email address and name are shared solely for delivery purposes.</li>
                <li><span className="font-black text-black">Legal Compliance</span> — We may disclose your information if required by law, court order, or government authority.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">5. Cookies & Tracking</h2>
              <p>
                Our website uses essential cookies and session storage to maintain your shopping cart and
                checkout session. We do not currently use third-party advertising or tracking cookies.
                You may disable cookies in your browser settings; however, this may affect your ability
                to complete a purchase.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">6. Data Retention</h2>
              <p>
                We retain order records (name, address, order details) for a minimum of <span className="font-black text-black">7 years</span> to
                comply with U.S. tax and accounting regulations. Email communications are retained for
                up to <span className="font-black text-black">3 years</span>. You may request deletion of your personal data at any time
                (see Section 8), subject to legal retention requirements.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">7. Data Security</h2>
              <p>
                We implement industry-standard security measures including HTTPS encryption, httpOnly
                secure cookies, and access controls to protect your personal information. Payment data
                is never stored on our servers — it is processed exclusively by Stripe. While we take
                reasonable precautions, no method of data transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">8. Your Rights</h2>
              <p className="mb-3">
                Depending on your state of residence, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="font-black text-black">Access:</span> Request a copy of the personal data we hold about you.</li>
                <li><span className="font-black text-black">Correction:</span> Request that we correct inaccurate information.</li>
                <li><span className="font-black text-black">Deletion:</span> Request that we delete your personal data, subject to legal retention requirements.</li>
                <li><span className="font-black text-black">Opt-Out:</span> Opt out of marketing emails at any time via the unsubscribe link or by emailing us directly.</li>
              </ul>
              <p className="mt-3">
                California residents have additional rights under the{" "}
                <span className="font-black text-black">California Consumer Privacy Act (CCPA)</span>, including
                the right to know what personal information is collected and the right to non-discrimination
                for exercising privacy rights.
              </p>
              <p className="mt-3">
                To exercise any of these rights, email us at{" "}
                <span className="font-black">hello@thecaliforniapickle.com</span> with the subject line
                "Privacy Request." We will respond within 45 days.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">9. Children's Privacy</h2>
              <p>
                Our products and website are not directed to individuals under the age of 13. We do not
                knowingly collect personal information from children under 13. If you believe we have
                inadvertently collected such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">10. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites (e.g., social media platforms). We
                are not responsible for the privacy practices of those sites and encourage you to review
                their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. The "Last updated" date at the top
                of this page will reflect any changes. Continued use of our website after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">12. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="mt-3 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
                <p className="font-black text-black uppercase tracking-widest text-xs">The California Pickle LLC</p>
                <p className="text-xs mt-1">1999 Harrison Street, Suite 1800</p>
                <p className="text-xs">Oakland, CA 94612</p>
                <p className="text-xs mt-1 font-black">hello@thecaliforniapickle.com</p>
              </div>
            </section>

          </div>

          <div className="mt-16 pt-8 border-t-2 border-black">
            <Link href="/" className="btn-outline px-8 py-3 inline-block text-xs font-black uppercase tracking-widest">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
