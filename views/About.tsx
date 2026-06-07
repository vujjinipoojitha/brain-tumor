
import React from 'react';

interface Props {
  onNavigate: (view: string) => void;
}

const About: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <nav className="mb-12 flex items-center justify-between border-b border-gray-100 pb-6">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-burgundy transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          BACK TO HOME
        </button>
        <span className="text-[10px] font-black text-burgundy uppercase tracking-[0.2em]">Institutional Information</span>
      </nav>

      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-burgundy mb-4 tracking-tight">Advanced Neuro-AI Diagnostics</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">Bridging the gap between cutting-edge computer vision and clinical neurological expertise.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed font-medium">
            TumORnot was founded to support hospital diagnostic workflows by providing rapid, AI-first classification 
            of neurological abnormalities. We empower clinicians with secondary verification tools that decrease 
            response times in critical care environments.
          </p>
        </div>
        <div className="bg-burgundy/5 p-8 rounded-[2rem] border border-burgundy/10 shadow-inner">
          <h3 className="text-xl font-bold text-burgundy mb-4">Core Technology</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-sm text-gray-700 font-medium">
              <span className="text-burgundy mt-1">●</span>
              Deep Learning CNN models trained on thousands of MRI brain scan samples.
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700 font-medium">
              <span className="text-burgundy mt-1">●</span>
              Grad-CAM (Gradient-weighted Class Activation Mapping) for anatomical explainability.
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700 font-medium">
              <span className="text-burgundy mt-1">●</span>
              WebRTC-integrated image capture for rapid facility-side data acquisition.
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">Designed for Medical Scale</h2>
        <p className="text-gray-600 mb-10 max-w-xl mx-auto font-medium">
          Our architecture is built for the enterprise hospital, supporting high-concurrency scan processing 
          and secure role-based access for facility administrators and neurological staff.
        </p>
        <div className="flex justify-center gap-12 grayscale opacity-40">
          <img src="https://picsum.photos/seed/med1/100/40" alt="Med Cert" />
          <img src="https://picsum.photos/seed/med2/100/40" alt="ISO Cert" />
          <img src="https://picsum.photos/seed/med3/100/40" alt="AI Cert" />
        </div>
      </div>
    </div>
  );
};

export default About;
