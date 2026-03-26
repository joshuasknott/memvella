import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { UserPlus, BookOpen, Calendar, MessageSquare, ArrowRight, Coffee, Video, Heart, Home, Settings } from 'lucide-react';

export default function CaregiverDashboard() {
  return (
    <div className="flex flex-col gap-6 px-4 w-full">
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
          <Link href="/caregiver/add-memory" className="flex-1 min-h-[100px] flex flex-col items-center justify-center gap-3 p-4 bg-surface-container-lowest rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.03)] active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
              <BookOpen className="text-on-primary-fixed-variant w-6 h-6" />
            </div>
            <span className="font-label text-[10px] font-bold text-on-surface text-center">Add Memory</span>
          </Link>
          <Link href="/caregiver/add-routine" className="flex-1 min-h-[100px] flex flex-col items-center justify-center gap-3 p-4 bg-surface-container-lowest rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.03)] active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
              <Calendar className="text-on-tertiary-fixed-variant w-6 h-6" />
            </div>
            <span className="font-label text-[10px] font-bold text-on-surface text-center">Add Routine</span>
          </Link>
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
          <p className="text-on-primary font-medium text-sm mb-6 leading-relaxed">
            Memvella identified that Emily prefers Earl Grey tea with honey.
          </p>
          <Link href="/caregiver/insights" className="w-full h-14 bg-on-primary text-primary font-bold rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            Review New Info
            <ArrowRight className="w-4 h-4 outline-none" />
          </Link>
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
    </div>
  );
}
