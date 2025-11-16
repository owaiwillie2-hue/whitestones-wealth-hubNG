import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { InvestmentOptions } from "@/components/landing/InvestmentOptions";
import { InvestmentPlans } from "@/components/landing/InvestmentPlans";
import { HowToJoin } from "@/components/landing/HowToJoin";
import { Testimonials } from "@/components/landing/Testimonials";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { CryptoTicker } from "@/components/landing/CryptoTicker";
import { FloatingNotifications } from "@/components/landing/FloatingNotifications";
import { StatsSection } from "@/components/landing/StatsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingNotifications />
      <Header />
      <main>
        <HeroSection />
        <CryptoTicker />
        <StatsSection />
        <PartnersSection />
        <AboutSection />
        <InvestmentOptions />
        <InvestmentPlans />
        <HowToJoin />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;