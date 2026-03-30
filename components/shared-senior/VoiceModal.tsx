import { Mic } from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceModal({ isOpen, onClose }: VoiceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-300">
      <div className="bg-white/95 rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-lg text-center relative flex flex-col items-center space-y-12">
        <h2 className="font-headline text-3xl font-bold text-slate-900 mt-4">
          Listening...
        </h2>
        
        {/* Pulsing Waveform/Ring Animation */}
        <div className="relative flex items-center justify-center h-40 w-40">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-4 rounded-full bg-primary/40 animate-pulse"></div>
          <div className="relative h-24 w-24 rounded-full bg-linear-to-r from-[#4e0078] to-[#7a2e9e] text-white shadow-xl flex items-center justify-center z-10">
            <Mic size={40} strokeWidth={2.5} />
          </div>
        </div>

        <button 
          onClick={onClose}
          className="mt-8 bg-error text-white font-bold text-xl py-4 px-12 rounded-full shadow-lg hover:bg-error/90 active:scale-95 transition-all w-full md:w-auto"
        >
          Stop Recording
        </button>
      </div>
    </div>
  );
}
