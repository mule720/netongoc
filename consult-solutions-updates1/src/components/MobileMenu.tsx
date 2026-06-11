import React from 'react';
import { Link } from 'react-router-dom';
import { X, Facebook, Linkedin, Youtube, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSectionClick: (sectionId: string) => void;
}

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Clients', to: '/clients' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Updates', to: '/updates' },
  { label: 'About Us', to: '/about' },
  { label: '🛒 Products', to: '/products' },
];

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b border-white/10">
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
        <ul className="space-y-1">
          {navItems.map(({ label, to }) => (
            <li key={to}>
              <Link
                to={to}
                onClick={onClose}
                className="block py-3 px-4 rounded-lg hover:bg-white/10 transition-colors font-medium"
                style={{
                  textDecoration: 'none', color: 'inherit',
                  ...(to === '/products' ? { background: 'rgba(245,194,0,0.15)', color: '#F5C200', marginTop: '0.5rem' } : {}),
                }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Connect With Us</h3>
          <div className="flex space-x-4 mb-4">
            <a href="https://web.facebook.com/profile.php?id=100080013815882" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300"><Facebook className="h-6 w-6" /></a>
            <a href="https://www.linkedin.com/company/neton-limited" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300"><Linkedin className="h-6 w-6" /></a>
            <a href="https://youtube.com/@chileshemulenga7848?si=VBGuhRNVEm-25HPc" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300"><Youtube className="h-6 w-6" /></a>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-amber-300" />
              <a href="tel:+260967789837" className="hover:text-amber-300">+260 967 789 837</a>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-amber-300" />
              <a href="mailto:netongoc@hotmail.com" className="hover:text-amber-300">netongoc@hotmail.com</a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;
