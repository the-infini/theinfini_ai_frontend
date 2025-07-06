import React from 'react';
import {
  Header,
  HeroSection,
  FeaturesSection,
  AboutSection,
  CTASection,
  Footer
} from '../components/landingPage';
import PricingSection from '../components/landingPage/PricingSection/PricingSection';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
