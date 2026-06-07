
import React from 'react';

interface Props {
  onNavigate: (view: string) => void;
}

const Home: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="max-w-4xl text-center space-y-10">
        <div className="space-y-4">
          <h2 className="text-5xl md:text-7xl font-extrabold text-burgundy tracking-tight leading-none">
            TumORnot
          </h2>
          <p className="text-xl md:text-2xl font-medium text-gray-500 uppercase tracking-widest">
            AI-Assisted Brain Tumor Detection System
          </p>
        </div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          A secure, hospital-grade diagnostic platform leveraging Deep Learning and Grad-CAM 
          to provide clinicians and patients with precision neurological insights.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 max-w-2xl mx-auto w-full">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group flex flex-col items-center text-center" onClick={() => onNavigate('hospital-login')}>
            <div className="w-16 h-16 bg-burgundy/10 text-burgundy rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10V4m0 10V4m-4 11h.01" /></svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Hospital Portal</h3>
            <p className="text-gray-500 text-sm mb-8">Access the diagnostic ecosystem for clinicians and hospital administrators.</p>
            <span className="px-8 py-3 bg-burgundy text-white rounded-full font-bold text-sm">Secure Login</span>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group flex flex-col items-center text-center" onClick={() => onNavigate('patient-login')}>
            <div className="w-16 h-16 bg-burgundy/10 text-burgundy rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Patient Portal</h3>
            <p className="text-gray-500 text-sm mb-8">Manage your scans, view AI reports, and track your neurological health journey.</p>
            <span className="px-8 py-3 bg-burgundy text-white rounded-full font-bold text-sm">Patient Access</span>
          </div>
        </div>

        <div className="pt-20 opacity-30 flex justify-center gap-12 grayscale">
          <img src="https://picsum.photos/seed/h1/120/40" alt="Med Cert" />
          <img src="https://picsum.photos/seed/h2/120/40" alt="ISO Cert" />
        </div>
      </div>
    </div>
  );
};

export default Home;
