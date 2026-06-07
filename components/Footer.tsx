
import React from 'react';

interface Props {
  onNavigate: (view: string) => void;
}

const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-burgundy p-1.5 rounded-lg cursor-pointer" onClick={() => onNavigate('home')}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-burgundy cursor-pointer" onClick={() => onNavigate('home')}>TumORnot</h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Advancing neurological diagnostics through precision AI and clinician-verified analysis.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-500 font-medium">
              <li><button onClick={() => onNavigate('home')} className="hover:text-burgundy transition">Home</button></li>
              <li><button onClick={() => onNavigate('about')} className="hover:text-burgundy transition">About Brain Tumors</button></li>
              <li><button onClick={() => onNavigate('faq')} className="hover:text-burgundy transition">FAQ</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest">Portals</h4>
            <ul className="space-y-2 text-sm text-gray-500 font-medium">
              <li><button onClick={() => onNavigate('hospital-login')} className="hover:text-burgundy transition">Hospital Intake</button></li>
              <li><button onClick={() => onNavigate('patient-login')} className="hover:text-burgundy transition">Patient Records</button></li>
              <li><button onClick={() => onNavigate('hospital-signup')} className="hover:text-burgundy transition">Register Facility</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500 font-medium">
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-burgundy transition">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('terms')} className="hover:text-burgundy transition">Terms of Service</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-burgundy transition">Contact Support</button></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-50 text-center">
          <p className="text-gray-400 text-xs font-medium">© 2024 TumORnot Medical Systems. Not a substitute for professional medical advice.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
