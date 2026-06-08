import React from 'react';
import { Mail, Phone, MapPin, Facebook, Linkedin, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-200 py-16 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="https://d64gsuwffb70l.cloudfront.net/68753d9e71414e5e3628056e_1753211163235_f5e9ff17.png" 
                alt="NETON Limited Logo" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Empowering businesses through innovative strategies and cutting-edge technology solutions.
            </p>
            <div className="flex space-x-4">
              <a href="https://web.facebook.com/profile.php?id=100080013815882" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/neton-limited" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://youtube.com/@chileshemulenga7848?si=VBGuhRNVEm-25HPc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Business Support</li>
              <li>Accounting Services</li>
              <li>Technology Solutions</li>
              <li>Financing</li>
              <li>Procurement</li>
              <li>Wealth Management</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:netongoc@hotmail.com" className="hover:text-yellow-400 transition-colors">
                  netongoc@hotmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+260967789837" className="hover:text-yellow-400 transition-colors">
                  +260967789837
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <a href="https://wa.me/260967789837" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
                  WhatsApp: +260967789837
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 NETON Limited. All rights reserved. <a href="/admin" className="text-blue-400 hover:text-blue-300 underline">(admin)</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;