
import React from 'react';

interface Props {
  prediction: 'Tumor' | 'No Tumor';
  confidence: number;
}

const ResultSummaryCard: React.FC<Props> = ({ prediction, confidence }) => {
  let risk: 'HIGH' | 'MODERATE' | 'LOW' | 'UNCERTAIN' = 'UNCERTAIN';
  let riskColor = 'text-slate-500 bg-slate-50';
  let explanation = '';

  if (prediction === 'Tumor') {
    if (confidence >= 85) {
      risk = 'HIGH';
      riskColor = 'text-burgundy bg-red-50 border-red-100';
      explanation = 'High risk indicates strong abnormal patterns detected by the model. Immediate consultation with a qualified medical professional is strongly recommended.';
    } else if (confidence >= 65) {
      risk = 'MODERATE';
      riskColor = 'text-amber-700 bg-amber-50 border-amber-100';
      explanation = 'Moderate risk indicates potential abnormal patterns. Clinical evaluation is advised.';
    }
  } else {
    if (confidence >= 80) {
      risk = 'LOW';
      riskColor = 'text-green-700 bg-green-50 border-green-100';
      explanation = 'Low risk indicates no strong abnormal patterns detected. Professional review is still recommended.';
    }
  }

  if (risk === 'UNCERTAIN') {
    explanation = 'Prediction uncertainty detected. Expert medical review is strongly recommended.';
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-50 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Model Prediction</p>
          <p className={`text-4xl font-black ${prediction === 'Tumor' ? 'text-red-600' : 'text-green-600'}`}>
            {prediction.toUpperCase()}
          </p>
        </div>
        <div className="space-y-1 text-left md:text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confidence</p>
          <p className="text-4xl font-black text-gray-800">{confidence}%</p>
        </div>
        <div className="space-y-1 text-left md:text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Risk Assessment</p>
          <div className={`px-6 py-2 rounded-full text-sm font-black border ${riskColor}`}>
            {risk} RISK
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <p className="text-sm text-gray-700 font-medium leading-relaxed">
          {explanation}
        </p>
      </div>
    </div>
  );
};

export default ResultSummaryCard;
