import React from 'react';
import { X, Facebook, Linkedin, Youtube, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSectionClick: (sectionId: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onSectionClick }) => {
  if (!isOpen) return null;

  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-blue-900 text-white">
      <div className="flex justify-between items-center p-4 border-b border-blue-800">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68753d9e71414e5e3628056e_1753211163235_f5e9ff17.png" 
          alt="NETON Limited Logo" 
          className="h-8 w-auto"
        />
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-4">
          <li>
            <button 
              onClick={() => handleSectionClick('home')}
              className="block w-full text-left py-3 px-4 hover:bg-blue-800 rounded transition-colors"
            >
              Home
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleSectionClick('services')}
              className="block w-full text-left py-3 px-4 hover:bg-blue-800 rounded transition-colors"
            >
              Services
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleSectionClick('clients')}
              className="block w-full text-left py-3 px-4 hover:bg-blue-800 rounded transition-colors"
            >
              Clients
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleSectionClick('contact')}
              className="block w-full text-left py-3 px-4 hover:bg-blue-800 rounded transition-colors"
            >
              Contact Us
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleSectionClick('updates')}
              className="block w-full text-left py-3 px-4 hover:bg-blue-800 rounded transition-colors"
            >
              Updates
            </button>
          </li>
          <li>
            <button 
              onClick={() => handleSectionClick('about')}
              className="block w-full text-left py-3 px-4 hover:bg-blue-800 rounded transition-colors"
            >
              About Us
            </button>
          </li>
        </ul>
        
        <div className="mt-8 pt-8 border-t border-blue-800">
          <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
          <div className="flex space-x-4 mb-4">
            <a href="https://web.facebook.com/profile.php?id=100080013815882" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="https://www.linkedin.com/company/neton-limited" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="https://youtube.com/@chileshemulenga7848?si=VBGuhRNVEm-25HPc" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">
              <Youtube className="h-6 w-6" />
            </a>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <a href="tel:+260967789837" className="hover:text-yellow-400">+260967789837</a>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:netongoc@hotmail.com" className="hover:text-yellow-400">netongoc@hotmail.com</a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;