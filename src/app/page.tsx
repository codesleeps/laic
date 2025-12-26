"use client";

import { useEffect } from "react";
import {
  Navigation,
  HeroSection,
  AboutSection,
  FeaturesSection,
  IntegrationsSection,
  PricingSection,
  TestimonialsSection,
  ContactSection,
  Footer,
} from "@/components/landing";

export default function LandingPage() {
  // Add smooth scrolling behavior
  useEffect(() => {
    const handleHashClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === "A" && target.hash) {
        const element = document.querySelector(target.hash);
        if (element) {
          e.preventDefault();
          element.scrollIntoView({ behavior: "smooth" });
          history.pushState(null, "", target.hash);
        }
      }
    };

    document.addEventListener("click", handleHashClick);
    return () => document.removeEventListener("click", handleHashClick);
  }, []);

  return (
    <div className="min-h-screen scroll-smooth">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <IntegrationsSection />
      <PricingSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
