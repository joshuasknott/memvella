import { MonitorSmartphone } from 'lucide-react';

export default function PairingSettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 w-full flex-1 text-center">
      <div className="w-24 h-24 bg-purple-50 rounded-full flex flex-col items-center justify-center mb-10 border border-purple-100 shadow-sm relative overflow-hidden">
         <MonitorSmartphone className="w-10 h-10 text-purple-600 z-10" />
         <div className="absolute -bottom-4 right-0 w-12 h-12 bg-purple-200/50 rounded-full blur-xl"></div>
      </div>
      
      <p className="font-headline text-2xl font-bold text-gray-900 mb-4">Pair Senior Tablet</p>
      <p className="text-gray-500 text-sm max-w-[240px] leading-relaxed mb-8">
        Enter this code on Mom's device to connect the Memvella instances securely.
      </p>
      
      <div className="bg-white border-2 border-dashed border-purple-200 rounded-3xl p-8 w-full shadow-sm max-w-[300px]">
           <span className="font-mono font-bold tracking-[0.2em] text-4xl text-purple-600">784-921</span>
      </div>
    </div>
  );
}
