import { useState, useEffect } from 'react';
import { Navbar } from '@/components/home/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { PreviewSection } from '@/components/home/PreviewSection';
import { GallerySection } from '@/components/home/GallerySection';
import { PricingSection } from '@/components/home/PricingSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { Footer } from '@/components/home/Footer';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      return (stored as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <Helmet>
        <title>ParticleFX - Turn Images into Cinematic 3D Particle Videos</title>
        <meta name="description" content="Create stunning 3D transitions from static images using real-time particle animations. No 3D experience required. Start creating free today." />
        <meta name="keywords" content="particle animation, 3D video, image to video, WebGL, motion graphics, video effects" />
        <link rel="canonical" href="https://particlefx.app" />
        
        {/* Open Graph */}
        <meta property="og:title" content="ParticleFX - Turn Images into Cinematic 3D Particle Videos" />
        <meta property="og:description" content="Create stunning 3D transitions from static images using real-time particle animations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://particlefx.app" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ParticleFX - Turn Images into Cinematic 3D Particle Videos" />
        <meta name="twitter:description" content="Create stunning 3D transitions from static images using real-time particle animations." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Navbar theme={theme} onThemeToggle={toggleTheme} />
        
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <PreviewSection />
          <GallerySection />
          <PricingSection />
          <TestimonialsSection />
          <CTASection />
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Index;