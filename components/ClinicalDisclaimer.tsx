
import React from 'react';

const ClinicalDisclaimer: React.FC = () => {
  return (
    <div className="mt-8 text-center border-t border-gray-50 pt-6">
      <div className="inline-flex items-center gap-2 bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Final diagnosis must always be confirmed by a qualified medical professional.
        </p>
      </div>
    </div>
  );
};

export default ClinicalDisclaimer;
