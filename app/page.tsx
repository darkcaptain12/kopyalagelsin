"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import AnnouncementBar from "@/components/AnnouncementBar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Advantages from "@/components/Advantages";
import FAQ from "@/components/FAQ";
import OrderForm from "@/components/OrderForm";
import Footer from "@/components/Footer";
import SignupPopup from "@/components/SignupPopup";
import type { MarketingConfig } from "@/lib/config";

export default function Home() {
  const [marketingConfig, setMarketingConfig] = useState<MarketingConfig | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.marketing) {
          setMarketingConfig(data.marketing);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <HowItWorks />
      <Advantages />
      <FAQ />
      <OrderForm />
      <Footer />
      {marketingConfig && (
        <SignupPopup
          enabled={marketingConfig.enableSignupPopup}
          discountPercent={marketingConfig.memberWelcomeDiscountPercent}
        />
      )}
    </div>
  );
}
