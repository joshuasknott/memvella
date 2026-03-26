"use client";

import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { Mic, X } from 'lucide-react';

export default function ListeningStatePage() {

  const handleEndChat = () => {
    // // TODO: Convex mutation to save the completed voice session conversation logs
    console.log("Saving conversation logs...");
  };

  return (
    <div className="bg-background font-body text-on-background overflow-hidden min-h-screen">
      {/* Background Layer: Heavily Blurred Photo Gallery */}
      <div className="fixed inset-0 z-0 grid grid-cols-3 gap-4 p-4 scale-110 blur-2xl opacity-60 pointer-events-none">
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkqdWw7UzIAVOKSCwaVCjqRiyNKabCMN4YN5CK7bFcWBI43PIqrf_C7xTRqeLEFcttamF8p4wZghyu2OmOuutZxXnHILyFeTEXhh6n5LKs46v0E3CdiQ_W0THnNRbYrZCaVubWw9ebaEoZnDUsQt7ZaYa3_RLDvQADxrBD48Ag5FDAhuW8MzzAUp-TWzN8QodSlD0y7AmtdtAGYx2_r4nRdhIO2o-iwpK6-1Js8evQdH9oP99J67uGPWYwjcfnbjapelnnZyaTPF2W"/>
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtrPZQaLdCsIApfz19RpcPYfyqlQRCQ9AGMAv0yJuTGfaRgZhTe0iUR5lOW_q97X14OByXpE2kC2RbXiutuMt79gZ2CM45feP8EgUn9ob4g9hch88W-QAWeosU091YhTU-dJJ6mAkYathcjf2BTfqOk1hEHJ1J1jg7MTsroAWDh1ROL6bewoPpP2-QXsZnmORqzpyviibZ_0EdMYRPutFbTtIBMArjTCMBiFMhZAfsgNzW3XuZB9PLRN5xqTOX0hXvRVUi5s15YMP1"/>
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD65mON6T2r12jbhtO59IAZOWziWt8HIAhKkDGW6eQSSyG3--XXNZ6H2836EEhFcYTk00pdWaJ7WQ3cOt4JiilO0_UqASDG05jc8BXpTEP2GB-TpHflsFVWnW3aqhm6Px1_4G26R41ZTy6HdHD1boTvaHN4NbCfHgBYHs5bIsv2fTkJsO_MKz6xXq6E1ESiRJ9e65YGCoPe4rHl5ypT2Tegw9RbZY_A6qiv-17p2w7uFLI8sh4iPBopbDt0kinZ8CiVyEVf4iulEQyn"/>
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2i7zWLg1-ElrK4FiUY5Xpa169INvvz59sbtfz973xX1i1Cs4495z9VMITrTbrtx5VYeZwQZdQ9zqTz0N7G0-jgHzgqoDWTWzPsLevJCXkroblNdg20MvlShSzZaLzJOKtLNa_0zSF3pYHQL7V2hi6Q1R4dH3d0-bubA2paN-b-GYQ3hzLnHvE82X-fvtYD0xZaFe9HOhuNpVeiLfkhTDpKOFQeCozAhfm4i9AsrZCrAdKiRPvp-kfZ12qyWH3nyLva6ZCMs33DvkH"/>
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxIJyf4TUNedMHkxAWdQ5lTp8DqX88kZdPAhDDIxoxl2Iu2_3ACeV8y7hNXA14jNKiGyRvTQhacoacQDPiOso4Qjx2h-kpMNDxmLv8Whpj7Ui6KX-fkYvS4Y43AhYtwOjRhrZMgc6oRWw9SWCQ_RqpJ8mzvxHuxZtfZi6tGSAp7GkyWY6McqmiM6xSfc54qBMJIHD0V0T3z9J1aZ-KzovIBc07AAalREd-GY1oPTXHGY0zcZwv5U2iCAf7tbhJevpWaj1dFozswfyr"/>
        <img className="w-full h-full object-cover rounded-3xl" alt="Gallery memory 6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClO5R-6p4r0mKwaRwqg6twsBnPOLzfjrZUEREjLf2m8fyd9O-bljs_fbLOCptD16bymePeZPMeRWHLOy7dkW2K1NR82UeUy1JjEat31MnBPfgmguJke3jT7-kGZY8gPe8ZfcB9AKwJAuUpvRnpjgeoEKnWP2NLSeyh1VuxTgguL9OOEE8Pwb0BTbR66ywqlQeWFiwE6hQHmyDd7IWUYjH5xX-Pp3pkZHk-H9fAMTlY3xSRSO-85bfCFLdVlEN8fdkuLFz_Baco_j64"/>
      </div>

      {/* Frosted Glass Overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xl z-50 pointer-events-none"></div>

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-60 flex justify-between items-center px-10 h-24">
        <BrandLogo />
      </header>

      {/* Main Content Canvas */}
      <main className="relative z-60 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        
        {/* Voice Interaction Visualizer */}
        <div className="relative flex items-center justify-center mb-12">
          {/* Pulsing outer ring */}
          <div 
            className="absolute w-80 h-80 rounded-full bg-linear-to-br from-primary to-secondary opacity-15 animate-pulse"
            style={{ boxShadow: '0 0 80px rgba(70, 21, 153, 0.3), 0 0 120px rgba(0, 95, 175, 0.15)' }}
          ></div>
          
          {/* Inner glowing circle (MANDATORY FIX: Added rounded-full explicitly, though originally present, to ensure circularity) */}
          <div className="relative w-64 h-64 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-2xl">
            <Mic className="text-white" size={120} strokeWidth={2} />
          </div>
        </div>

        {/* High-Contrast Transcription */}
        <div className="max-w-4xl space-y-6">
          {/* MANDATORY FIX: Darkened "Listening..." text to text-gray-800 for contrast */}
          <h1 className="font-headline text-gray-800 font-bold text-5xl tracking-tight">
            Listening...
          </h1>
          <p className="font-headline text-on-background font-extrabold text-6xl md:text-8xl leading-tight">
            &quot;When is Emily coming over?&quot;
          </p>
        </div>
      </main>

      {/* Contextual Footer Actions */}
      <div className="fixed bottom-12 right-12 z-60">
        <Link 
          href="/senior"
          onClick={handleEndChat}
          className="flex items-center gap-5 px-12 py-8 bg-error-container text-on-error-container rounded-full shadow-2xl hover:bg-[#ffb4ab] transition-all active:scale-95 group"
        >
          <span className="font-headline font-bold text-3xl">End Chat</span>
          <div className="w-12 h-12 rounded-full bg-on-error-container text-white flex items-center justify-center">
            <X className="font-bold w-8 h-8" strokeWidth={3} />
          </div>
        </Link>
      </div>
    </div>
  );
}
