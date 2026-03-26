import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { UserPlus, BookOpen, Calendar, MessageSquare, ArrowRight, Coffee, Video, Heart, Home, Settings } from 'lucide-react';

export default function CaregiverDashboard() {
  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-surface/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <BrandLogo />
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 space-y-8">
        {/* Connection Hero: Engagement Summary */}
        {/* // TODO: Convex query to fetch the loved one's connection status/summary */}
        <section className="bg-linear-to-br from-primary-fixed to-secondary-fixed rounded-lg p-8 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label text-xs font-semibold tracking-widest uppercase text-primary/60">Current Status</span>
            </div>
            <h2 className="font-headline font-bold text-2xl leading-tight text-on-primary-fixed mb-2">Mom is doing well today.</h2>
            <p className="text-[#1a1c1a] leading-relaxed">She chatted with Memvella this morning and looked at the family photos.</p>
          </div>
          {/* Decorative Asymmetry */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
        </section>

        {/* Quick Actions */}
        <section className="relative z-10">
          <div className="flex justify-between gap-4">
            <Link href="/caregiver/add-person" className="flex-1 min-h-[100px] flex flex-col items-center justify-center gap-3 p-4 bg-surface-container-lowest rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.03)] active:scale-95 transition-transform">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center">
                <UserPlus className="text-on-secondary-fixed-variant w-6 h-6" />
              </div>
              <span className="font-label text-[10px] font-bold text-on-surface text-center">Add Person</span>
            </Link>
            <button className="flex-1 min-h-[100px] flex flex-col items-center justify-center gap-3 p-4 bg-surface-container-lowest rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.03)] active:scale-95 transition-transform">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
                <BookOpen className="text-on-primary-fixed-variant w-6 h-6" />
              </div>
              <span className="font-label text-[10px] font-bold text-on-surface text-center">Add Memory</span>
            </button>
            <button className="flex-1 min-h-[100px] flex flex-col items-center justify-center gap-3 p-4 bg-surface-container-lowest rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.03)] active:scale-95 transition-transform">
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
                <Calendar className="text-on-tertiary-fixed-variant w-6 h-6" />
              </div>
              <span className="font-label text-[10px] font-bold text-on-surface text-center">Add Routine</span>
            </button>
          </div>
        </section>

        {/* The Review Card */}
        {/* // TODO: Convex query to fetch pending approvals/insights */}
        <section className="-mt-4 relative z-20">
          <div className="bg-primary p-6 rounded-lg shadow-[0_25px_50px_rgba(78,0,120,0.2)] border border-primary/5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-on-primary-container/20 flex items-center justify-center">
                <MessageSquare className="text-on-primary-container fill-on-primary-container/20 w-6 h-6" />
              </div>
              <span className="bg-on-primary-container/10 text-on-primary-container text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">New Insights</span>
            </div>
            <p className="text-on-primary text-lg font-medium leading-snug mb-6">
              Memvella learned 2 new things from chatting with Mom today. Tap to approve.
            </p>
            <button className="w-full h-14 bg-on-primary text-primary font-bold rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              Review New Info
              <ArrowRight className="w-4 h-4 outline-none" />
            </button>
          </div>
        </section>

        {/* Today's Updates */}
        {/* // TODO: Convex query to fetch timeline updates */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-xl px-2">Today&apos;s Updates</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-5 p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container transition-colors">
              <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                <Coffee className="text-secondary w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">10:00 AM</p>
                <p className="font-medium text-on-surface">Morning Tea routine completed.</p>
              </div>
            </div>

            <div className="flex items-center gap-5 p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container transition-colors">
              <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                <Video className="text-primary w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">2:00 PM</p>
                <p className="font-medium text-on-surface">Video call with Emily.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm">
              <img alt="Family connection" className="w-full h-48 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvdnjfvGCacJU6gJfUSBgn-Tzpt5V-9V-xKB_OUov6yY9JuX98oxUNELVIJa9R10E5Nsu53nLD39D-F76FDSr5m8Q06jTLe4SRsqJ6vSQZ9e7qoYnBn_XGXy0nkAEoYW_1huqcOiEQpSjdcxQ8mNAwZj3tef7tH10-qBketzKksw7w9ztShyFr1KMrz6CGuWrvVM4XVv4Qv3_3iv-rmsd8Cv2NqnWAp43cNeVi1KfzEMaBLVN6bsDmq8dtcucEmFSMI9hbGXv8t4U" />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center">
                    <Heart className="text-on-tertiary-fixed-variant w-4 h-4 fill-on-tertiary-fixed-variant" />
                  </div>
                  <p className="font-medium text-on-surface">Mom viewed the wedding album.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white border-t border-outline-variant/20 shadow-[-10px_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-4 pb-8 pt-4">
          <Link href="/caregiver" className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-full px-6 py-2 transition-transform active:scale-90">
            <Home className="w-6 h-6 fill-primary/20" />
            <span className="font-lexend text-[10px] font-bold mt-1">Updates</span>
          </Link>
          <button className="flex flex-col items-center justify-center text-on-surface-variant px-6 py-2 transition-transform active:scale-90 hover:bg-primary/5">
            <MessageSquare className="w-6 h-6" />
            <span className="font-lexend text-[10px] font-semibold mt-1">Review</span>
          </button>
          <button className="flex flex-col items-center justify-center text-on-surface-variant px-6 py-2 transition-transform active:scale-90 hover:bg-primary/5">
            <BookOpen className="w-6 h-6" />
            <span className="font-lexend text-[10px] font-semibold mt-1">Memories</span>
          </button>
          <button className="flex flex-col items-center justify-center text-on-surface-variant px-6 py-2 transition-transform active:scale-90 hover:bg-primary/5">
            <Settings className="w-6 h-6" />
            <span className="font-lexend text-[10px] font-semibold mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
}
