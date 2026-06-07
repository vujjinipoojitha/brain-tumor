
import React from 'react';

interface Props {
  onNavigate: (view: string) => void;
}

const FAQ: React.FC<Props> = ({ onNavigate }) => {
  const faqs = [
    { q: "Is the AI diagnosis final?", a: "No. TumORnot is an AI-assisted tool designed to highlight suspicious regions for radiologists. All final diagnoses must be confirmed by a qualified medical professional." },
    { q: "What is Grad-CAM?", a: "Grad-CAM (Gradient-weighted Class Activation Mapping) is a technique that visualizes the 'attention' of the neural network, allowing doctors to see exactly which areas of the brain scan led to the AI's conclusion." },
    { q: "How secure is my medical data?", a: "We utilize hospital-grade encryption and strictly follow data privacy standards. In this demo, data is stored locally in your browser and never leaves your device." },
    { q: "Can this detect all types of brain tumors?", a: "Our models are trained on high-grade gliomas, meningiomas, and pituitary tumors. While effective, rare tumor types may require additional diagnostic modalities." }
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <nav className="mb-12 flex items-center border-b border-gray-100 pb-6">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-burgundy transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          BACK
        </button>
      </nav>

      <h1 className="text-4xl font-black text-burgundy mb-4 text-center tracking-tight">Frequently Asked Questions</h1>
      <p className="text-gray-500 text-center mb-12 font-medium">Clearing doubts about AI-assisted neuro-diagnostics.</p>
      
      <div className="space-y-6">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition duration-300">
            <h3 className="text-lg font-bold text-gray-800 mb-3 tracking-tight">{f.q}</h3>
            <p className="text-gray-600 leading-relaxed text-sm font-medium">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
