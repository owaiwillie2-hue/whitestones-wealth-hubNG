import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { language, setLanguage } = useLanguage();
  const [companyInfo, setCompanyInfo] = useState({
    email: 'whitestonesmarkets@gmail.com',
    phone: '+1 (555) 123-4567',
    address: '123 Financial District, New York, NY 10004'
  });

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const { data } = await supabase
        .from('website_settings')
        .select('*')
        .in('key', ['company_email', 'company_phone', 'company_address']);

      if (data) {
        const settings: any = {};
        data.forEach(item => {
          settings[item.key.replace('company_', '')] = item.value;
        });
        setCompanyInfo(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <img src={logo} alt="Whitestones Markets" className="h-10 mb-4 brightness-0 invert" />
            <p className="text-primary-foreground/80 mb-4">
              Your trusted partner in building wealth through smart investments
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">About Us</a></li>
              <li><a href="#investments" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Investment Options</a></li>
              <li><Link to="/signup" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Open Account</Link></li>
              <li><Link to="/login" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Privacy Policy</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Terms & Conditions</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Risk Disclosure</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-fast">Compliance</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">{companyInfo.email}</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">{companyInfo.phone}</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80 text-sm">{companyInfo.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <select
                className="bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/30 rounded px-3 py-2 min-w-[150px]"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as any);
                  window.location.reload();
                }}
              >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <p className="text-primary-foreground/60 text-sm text-center md:text-right">
              © {currentYear} Whitestones Markets. All rights reserved.
            </p>
          </div>
        </div>

        <Link to="/admin/login" className="opacity-0 text-[0px] pointer-events-none select-none">Admin</Link>
      </div>
    </footer>
  );
};
