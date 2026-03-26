import Link from 'next/link';
import { BookOpen, UserPlus, Camera, Users, Mic } from 'lucide-react';

export default function CaregiverMemoriesPage() {
  return (
    <div className="flex flex-col gap-6 px-4 w-full">
      <div>
        <h1 className="font-headline font-extrabold text-3xl text-gray-900 tracking-tight">Family Directory</h1>
        <p className="text-gray-500 text-sm mt-2">Manage the people and stories in Mom's life.</p>
      </div>

      {/* Action Cards */}
      <section className="grid grid-cols-2 gap-4">
        <Link href="/caregiver/add-person" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-start gap-4 transition-transform active:scale-95">
          <div className="bg-blue-50 text-blue-600 rounded-full p-3 flex w-12 h-12 items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
              <span className="font-headline font-bold text-gray-900 text-base leading-tight">Add Person</span>
              <span className="text-[11px] text-gray-500 font-medium mt-0.5">Family & Friends</span>
          </div>
        </Link>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-start gap-4 transition-transform active:scale-95 relative overflow-hidden group">
          {/* Massive hidden hit area */}
          <Link href="/caregiver/add-memory" className="absolute inset-0 z-0"></Link>
          
          <div className="flex w-full justify-between items-start pointer-events-none">
            <div className="bg-purple-50 text-purple-600 rounded-full p-3 flex w-12 h-12 items-center justify-center relative z-10">
              <Camera className="w-6 h-6" />
            </div>
            
            {/* Floating Quick Mic action */}
            <Link 
              href="/caregiver/add-memory/voice"
              className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-3 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-colors z-20 relative pointer-events-auto group-active:scale-95"
            >
                <Mic className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="flex flex-col mt-auto relative z-10 w-full pointer-events-none">
              <span className="font-headline font-bold text-gray-900 text-base leading-tight">Add Memory</span>
              <span className="text-[11px] text-gray-500 font-medium mt-0.5">Photos & Stories</span>
          </div>
        </div>
      </section>

      {/* Family Members Placeholder */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-headline font-bold text-xl text-gray-900">Family Members</h2>
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase bg-purple-50 px-3 py-1 rounded-full">0 Added</span>
        </div>
        
        <div className="bg-purple-50/30 rounded-3xl p-8 border border-purple-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
            <Users className="w-7 h-7 text-purple-400" />
          </div>
          <p className="font-headline font-bold text-gray-900 text-lg mb-2">No family members yet</p>
          <p className="text-gray-500 text-sm max-w-[220px] leading-relaxed mb-6">
            Add family and friends to help Memvella recognize them in stories and photos.
          </p>
          <Link 
            href="/caregiver/add-person" 
            className="px-8 py-3.5 bg-linear-to-r from-[#1D4ED8] to-[#9333EA] text-white font-bold rounded-full shadow-md active:scale-95 transition-transform text-sm"
          >
            Get Started
          </Link>
          {/* // TODO: Convex query to fetch family members list */}
        </div>
      </section>
    </div>
  );
}
