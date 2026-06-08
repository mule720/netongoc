import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Facebook, Linkedin, Youtube, Phone, Mail } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onSectionClick: (sectionId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onSectionClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 text-white backdrop-blur-xl border-b border-white/10 shadow-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="text-white hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-3">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/68753d9e71414e5e3628056e_1753211163235_f5e9ff17.png" 
                alt="NETON Limited Logo" 
                className="h-12 w-auto"
              />
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => onSectionClick('home')} className="hover:text-amber-300 transition-colors font-medium">
              Home
            </button>
            <button onClick={() => onSectionClick('services')} className="hover:text-amber-300 transition-colors font-medium">
              Services
            </button>
            <button onClick={() => onSectionClick('clients')} className="hover:text-amber-300 transition-colors font-medium">
              Clients
            </button>
            <button onClick={() => onSectionClick('contact')} className="hover:text-amber-300 transition-colors font-medium">
              Contact Us
            </button>
            <button onClick={() => onSectionClick('updates')} className="hover:text-amber-300 transition-colors font-medium">
              Updates
            </button>
            <button onClick={() => onSectionClick('about')} className="hover:text-amber-300 transition-colors font-medium">
              About Us
            </button>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <a href="https://web.facebook.com/profile.php?id=100080013815882" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://www.linkedin.com/company/neton-limited" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://youtube.com/@chileshemulenga7848?si=VBGuhRNVEm-25HPc" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
              <Youtube className="h-5 w-5" />
            </a>
            <a href="https://wa.me/260967789837" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
              <Phone className="h-5 w-5" />
            </a>
            <a href="mailto:netongoc@hotmail.com" className="hover:text-amber-300 transition-colors">
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;