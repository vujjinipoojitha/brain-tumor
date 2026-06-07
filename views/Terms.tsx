
import React from 'react';

interface Props {
  onNavigate: (view: string) => void;
}

const Terms: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <nav className="mb-12 flex items-center border-b border-gray-100 pb-6">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-burgundy transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          BACK
        </button>
      </nav>

      <h1 className="text-4xl font-black text-burgundy mb-10 tracking-tight">Terms of Service</h1>
      
      <div className="space-y-10 text-gray-600 font-medium leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">1. Acceptance of Terms</h2>
          <p>By accessing the TumORnot platform, you agree to these Terms of Service. You must be a verified medical professional or authorized hospital administrator to access facility dashboards.</p>
        </section>

        <section className="p-8 bg-red-50 rounded-[2rem] border border-red-100">
          <h2 className="text-xl font-black text-red-600 mb-4 tracking-tight uppercase tracking-widest">2. No Clinical Advice</h2>
          <p className="font-bold text-red-700 mb-4">
            The AI output provided by TumORnot (including Tumor/No Tumor classification and Grad-CAM heatmaps) 
            is for educational and supportive use ONLY. It is NOT a final medical diagnosis.
          </p>
          <p className="italic text-red-600/80">
            All AI results MUST be reviewed and validated by a board-certified radiologist or neurosurgeon.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">3. Liability</h2>
          <p>TumORnot shall not be held liable for any diagnostic errors resulting from a failure to perform professional clinical verification of the AI's findings.</p>
        </section>

        <div className="pt-10 border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Updated: October 2024</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
