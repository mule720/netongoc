import React, { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import About from './About';
import ContactRequestForm from './ContactRequestForm';
import Services from './Services';
import Clients from './Clients';
import ConsultancyForm from './ConsultancyForm';
import Updates from './Updates';
import Footer from './Footer';
import MobileMenu from './MobileMenu';

const AppLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    scrollToSection('consultancy');
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(true);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header onMenuClick={handleMenuClick} onSectionClick={scrollToSection} />
      
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        onSectionClick={scrollToSection}
      />
      
      <main>
        <section id="home">
          <Hero onGetStarted={handleGetStarted} />
        </section>
        
        <section id="services" className="bg-gradient-to-br from-blue-900/90 via-slate-900/90 to-slate-950/90 py-20">
          <Services />
        </section>
        
        <section id="clients" className="bg-gradient-to-br from-emerald-900/90 via-teal-900/90 to-slate-900/90 py-20">
          <Clients />
        </section>
        
        <section id="consultancy" className="bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-slate-900/90 py-20">
          <ConsultancyForm />
        </section>

        <section id="contact" className="bg-gradient-to-br from-amber-900/90 via-orange-900/90 to-slate-900/90 py-20">
          <ContactRequestForm />
        </section>
        
        <section id="updates" className="bg-gradient-to-br from-orange-900/90 via-amber-900/90 to-slate-900/90 py-20">
          <Updates />
        </section>
        
        <section id="about" className="bg-gradient-to-br from-teal-900/90 via-cyan-900/90 to-slate-900/90 py-20">
          <About />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AppLayout;