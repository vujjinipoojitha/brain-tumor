
import React from 'react';

interface Props {
  roi: { x: number, y: number, width: number, height: number } | null;
  isVisible: boolean;
}

const HeatmapOverlay: React.FC<Props> = ({ roi, isVisible }) => {
  if (!roi || !isVisible) return null;

  return (
    <div 
      className="absolute border-2 border-red-500 rounded-full opacity-50 bg-red-500 blur-xl transition-all duration-700 pointer-events-none"
      style={{
        left: `${roi.x}%`,
        top: `${roi.y}%`,
        width: `${roi.width}%`,
        height: `${roi.height}%`,
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 60px 30px rgba(239, 68, 68, 0.4)'
      }}
    />
  );
};

export default HeatmapOverlay;
