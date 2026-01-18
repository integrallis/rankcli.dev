import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Pricing } from '@/components/landing/Pricing';

export function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-16">
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
