import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | The California Pickle",
  description: "Terms of Service and Refund Policy for The California Pickle LLC.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic text-black mb-2">
            Terms of <span className="text-[#a3e635]">Service</span>
          </h1>
          <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-12">
            Last updated: March 18, 2026
          </p>

          <div className="space-y-10 text-black/80 text-sm font-medium leading-relaxed">

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">1. Agreement to Terms</h2>
              <p>
                By accessing or using the website <span className="font-black text-black">thecaliforniapickle.com</span> (the "Site") or placing an order with The California Pickle LLC ("Company," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms in their entirety, do not use this Site or place any order.
              </p>
              <p className="mt-3">
                By clicking "Pay Now" or submitting an order, you expressly acknowledge that you have read, understood, and agree to these Terms, including the <span className="font-black text-black">No Refund / No Return Policy</span> in Section 5.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">2. Eligibility</h2>
              <p>
                You must be at least 18 years of age and a legal resident of the United States to place an order. By using the Site you represent and warrant that you meet these requirements and that all information you submit is accurate, truthful, and complete.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">3. Products & Pricing</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>All product descriptions, ingredient lists, and nutritional information are provided in good faith and are subject to change without notice.</li>
                <li>Prices are listed in U.S. dollars and are subject to change. The price displayed at checkout is the price you will be charged.</li>
                <li>We reserve the right to refuse or cancel any order at our sole discretion, including orders suspected of fraud or placed in error.</li>
                <li>Product images are representative. Actual packaging may vary.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">4. Payment</h2>
              <p>
                All payments are processed securely by <span className="font-black text-black">Stripe, Inc.</span> We do not store your payment card information on our servers. By providing payment details you authorize us to charge the total amount displayed at checkout, including applicable shipping fees and taxes.
              </p>
              <p className="mt-3">
                Orders are not confirmed until payment is successfully processed. You will receive an order confirmation email upon successful payment.
              </p>
            </section>

            <section className="border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">5. No Refund / No Return Policy</h2>

              <p className="font-black text-black uppercase tracking-wide mb-4">
                ALL SALES ARE FINAL. WE DO NOT ACCEPT RETURNS OR ISSUE REFUNDS.
              </p>

              <p className="mb-4">
                Due to the <span className="font-black text-black">perishable and consumable nature</span> of our food and beverage products, all sales are final once an order is placed. We cannot accept returns, exchanges, or cancellations for any reason, including but not limited to:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Change of mind or accidental order</li>
                <li>Dissatisfaction with taste, flavor, or texture</li>
                <li>Failure to achieve a desired personal result (individual results vary)</li>
                <li>Duplicate or mistaken orders</li>
                <li>Orders delayed by carrier after shipment</li>
              </ul>

              <p className="font-black text-black mb-3">5.1 — Damaged or Defective Items</p>
              <p className="mb-3">
                If your order arrives visibly damaged, leaking, or with a manufacturer defect, you must contact us at <span className="font-black text-black">support@thecaliforniapickle.com</span> within <span className="font-black text-black">48 hours of delivery</span> with:
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Your order number</li>
                <li>A clear description of the damage or defect</li>
                <li>Photographic evidence showing the damaged item(s) and the outer packaging</li>
              </ul>
              <p className="mb-3">
                Damage claims submitted after 48 hours of the delivery timestamp, or without photographic evidence, will not be accepted. Delivery timestamp is defined as the time recorded by the carrier upon delivery scan.
              </p>
              <p className="mb-3">
                If a valid damage claim is approved, we may, at our sole discretion, offer a replacement shipment of the same product or a store credit. We do not issue cash refunds for damaged items.
              </p>

              <p className="font-black text-black mb-3">5.2 — Lost Packages</p>
              <p>
                If the carrier marks your package as delivered but you have not received it, you must notify us within <span className="font-black text-black">5 business days</span> of the delivery date. We will open a carrier investigation. Resolution may result in a replacement shipment at our discretion once the investigation is complete. We are not responsible for packages stolen after delivery or delivered to an incorrect address provided by the customer.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">6. Shipping</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Shipping rates are calculated at checkout based on your delivery address and order weight.</li>
                <li>We ship within the contiguous United States. We do not currently ship internationally or to P.O. boxes.</li>
                <li>Estimated delivery times are provided by carriers and are not guaranteed. We are not liable for delays caused by carriers, weather, or circumstances beyond our control.</li>
                <li>You are responsible for providing an accurate and complete shipping address. We are not responsible for orders shipped to incorrect addresses provided by the customer.</li>
                <li>Risk of loss and title pass to you upon tender of the shipment to the carrier.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">7. Promotional Codes & Discounts</h2>
              <p>
                Promotional codes and discount coupons are issued at our discretion, are non-transferable, have no cash value, and may not be combined with other offers unless explicitly stated. Codes are valid only for the period specified and may be revoked at any time. Misuse or fraudulent use of promo codes will result in order cancellation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">8. Health & Medical Disclaimer</h2>
              <p>
                Our products are food and beverage supplements intended for healthy adults. They are <span className="font-black text-black">not intended to diagnose, treat, cure, or prevent any disease or medical condition</span>. Results vary by individual. Consult a qualified healthcare professional before use if you have a medical condition, are pregnant, nursing, or taking medication.
              </p>
              <p className="mt-3">
                The scientific claims referenced on our Site are based on general research into electrolyte function and pickle brine. We make no guarantee that you will experience any specific result.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">9. Intellectual Property</h2>
              <p>
                All content on this Site — including text, images, logos, product names, and branding — is the property of The California Pickle LLC and is protected by U.S. and international intellectual property laws. You may not copy, reproduce, distribute, or create derivative works without our express written consent.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">10. Disclaimer of Warranties</h2>
              <p>
                THE SITE AND ALL PRODUCTS ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">11. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE CALIFORNIA PICKLE LLC, ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SITE OR PURCHASE OF OUR PRODUCTS.
              </p>
              <p className="mt-3">
                IN ANY CASE, OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE ORDER GIVING RISE TO SUCH CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">12. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless The California Pickle LLC and its affiliates, officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or related to your violation of these Terms or your use of the Site.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">13. Governing Law & Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the <span className="font-black text-black">State of California</span>, without regard to its conflict of law provisions.
              </p>
              <p className="mt-3">
                Any dispute, claim, or controversy arising out of or relating to these Terms or your purchase shall first be submitted to informal negotiation by emailing us at <span className="font-black text-black">support@thecaliforniapickle.com</span>. If not resolved within 30 days, disputes shall be resolved by binding arbitration under the rules of the American Arbitration Association (AAA) in Oakland, California. Each party shall bear its own arbitration costs. You waive any right to a jury trial and any right to participate in a class action lawsuit or class-wide arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">14. Changes to These Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. The "Last updated" date at the top of this page will reflect changes. Your continued use of the Site or placement of an order after changes are posted constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black uppercase tracking-tight text-black mb-3">15. Contact Us</h2>
              <p>For any questions regarding these Terms, contact:</p>
              <div className="mt-3 p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
                <p className="font-black text-black uppercase tracking-widest text-xs">The California Pickle LLC</p>
                <p className="text-xs mt-1">1999 Harrison Street, Suite 1800</p>
                <p className="text-xs">Oakland, CA 94612</p>
                <p className="text-xs mt-1 font-black">support@thecaliforniapickle.com</p>
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
