
import React from 'react';

interface Props {
  onNavigate: (view: string) => void;
}

const Privacy: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <nav className="mb-12 flex items-center border-b border-gray-100 pb-6">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-burgundy transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          BACK
        </button>
      </nav>

      <h1 className="text-4xl font-black text-burgundy mb-10 tracking-tight">Privacy Policy</h1>
      
      <div className="prose prose-burgundy space-y-10 text-gray-600 font-medium leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">1. Data Collection & Usage</h2>
          <p>
            TumORnot collects MRI imaging data and basic patient identifiers strictly for the purpose of performing 
            AI analysis and record keeping. In this demonstration environment, all data is stored locally within 
            your browser's persistent storage (LocalStorage) and is not transmitted to our external servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">2. Patient Confidentiality</h2>
          <p>
            We adhere to the principles of medical data security. Only authorized hospital personnel logged 
            into a verified facility account have access to the scans and medical notes associated with their facility.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">3. AI Model Analysis</h2>
          <p>
            Image data processed by our AI models is used solely for inference. We do not use your private medical 
            scans to train our public models without explicit, written institutional consent.
          </p>
        </section>

        <section className="bg-burgundy/5 p-8 rounded-[2rem] border border-burgundy/10 shadow-sm">
          <p className="text-xs font-black text-burgundy mb-3 uppercase tracking-[0.2em]">Clinical Safeguard</p>
          <p className="text-sm text-gray-700 leading-relaxed font-semibold">
            This application is a demonstration of AI capabilities. It is not HIPAA compliant in this form 
            and should not be used for actual clinical diagnosis of real patients.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
