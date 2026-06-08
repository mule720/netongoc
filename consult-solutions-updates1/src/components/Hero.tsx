import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [heroContent, setHeroContent] = useState({
    tagline: '',
    heading: '',
    description: '',
    ctaText: '',
    backgroundImageUrl: '',
    overlayColor: '#000000',
    overlayOpacity: 0.6,
  });

  const ACTIVE_HERO_CONTENT_QUERY = `
    query {
      activeHeroContent {
        tagline
        heading
        description
        ctaText
        backgroundImageUrl
        overlayColor
        overlayOpacity
      }
    }
  `;

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const response = await fetch('/graphql/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: ACTIVE_HERO_CONTENT_QUERY }),
        });

        const payload = await response.json();
        const item = payload?.data?.activeHeroContent;
        if (item) {
          setHeroContent({
            tagline: item.tagline || '',
            heading: item.heading || '',
            description: item.description || '',
            ctaText: item.ctaText || '',
            backgroundImageUrl: item.backgroundImageUrl || '',
            overlayColor: item.overlayColor || '#000000',
            overlayOpacity:
              typeof item.overlayOpacity === 'number'
                ? Math.max(0, Math.min(1, item.overlayOpacity))
                : 0.6,
          });
        }
      } catch {}
    };

    fetchHeroContent();
  }, []);

  return (
    <section 
      className="relative text-white py-20 min-h-[600px] flex items-center"
      style={{
        backgroundImage: `url(${heroContent.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.6s ease-in-out'
      }}
    >
      {/* Overlay for better text readability */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: heroContent.overlayColor,
          opacity: heroContent.overlayOpacity,
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="hero-subheading mb-6 inline-block">
            {heroContent.tagline}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            {heroContent.heading}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-slate-100 drop-shadow-md">
            {heroContent.description}
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg" 
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-semibold px-8 py-3 shadow-2xl shadow-amber-500/30 hover:opacity-95"
          >
            {heroContent.ctaText} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;