
import React, { useRef, useState, useEffect } from 'react';

interface Props {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<Props> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        alert("Could not access camera. Please check permissions.");
        onClose();
      }
    }
    startCamera();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-burgundy">
        <video ref={videoRef} autoPlay playsInline className="w-full aspect-square object-cover" />
        <div className="absolute inset-0 border-2 border-white/20 pointer-events-none rounded-2xl m-8"></div>
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
          <button onClick={onClose} className="px-6 py-3 bg-white/20 backdrop-blur text-white rounded-full font-bold">Cancel</button>
          <button onClick={capture} className="w-16 h-16 bg-burgundy border-4 border-white rounded-full shadow-xl flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </button>
        </div>
      </div>
      <p className="mt-6 text-white/60 text-sm font-medium">Position the MRI scan within the frame</p>
    </div>
  );
};

export default CameraCapture;
