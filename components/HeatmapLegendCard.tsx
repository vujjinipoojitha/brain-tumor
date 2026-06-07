
import React from 'react';

const HeatmapLegendCard: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mt-4">
      <h4 className="text-xs font-black uppercase tracking-widest text-burgundy mb-4">
        Understanding the AI Heatmap
      </h4>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>
          <p className="text-xs font-bold text-gray-700">🔴 High model attention (areas most influential to the AI decision)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>
          <p className="text-xs font-bold text-gray-700">🟡 Moderate attention</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          <p className="text-xs font-bold text-gray-700">🔵 Low attention</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic">
          Note: This visualization supports clinical review. Intensity reflects model attention, not certainty or medical severity.
        </p>
      </div>
    </div>
  );
};

export default HeatmapLegendCard;
