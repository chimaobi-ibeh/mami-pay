import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import ProblemSection from '../components/landing/ProblemSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import InfrastructureSection from '../components/landing/InfrastructureSection';
import TrustSection from '../components/landing/TrustSection';
import GrowthSection from '../components/landing/GrowthSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <InfrastructureSection />
      <TrustSection />
      <GrowthSection />
      <CTASection />
      <Footer />
    </div>
  );
}
