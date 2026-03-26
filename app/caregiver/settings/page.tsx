import Link from 'next/link';
import { Bell, ChevronRight, MonitorSmartphone, User } from 'lucide-react';

export default function CaregiverSettingsPage() {
  return (
    <div className="flex flex-col gap-6 px-4 w-full">
      <div>
        <h1 className="font-headline font-extrabold text-3xl text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-2">Manage your account and device connections.</p>
      </div>

      {/* General Settings */}
      <section className="space-y-3">
        <Link href="/caregiver/settings/account" className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
             <div className="bg-gray-100 p-2.5 rounded-xl flex items-center justify-center">
               <User className="w-5 h-5 text-gray-600" />
             </div>
             <span className="text-gray-900 font-semibold text-[17px]">Account Details</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>

        <Link href="/caregiver/settings/notifications" className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center justify-between active:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
             <div className="bg-gray-100 p-2.5 rounded-xl flex items-center justify-center">
               <Bell className="w-5 h-5 text-gray-600" />
             </div>
             <span className="text-gray-900 font-semibold text-[17px]">Notifications</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </section>

      {/* Device Pairing */}
      <section>
        <div className="mb-3 px-2">
          <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Connections</span>
        </div>
        <Link href="/caregiver/settings/pairing" className="bg-purple-50/30 rounded-3xl p-5 shadow-sm border border-purple-200 flex items-center justify-between active:bg-purple-50/60 transition-colors mt-2">
          <div className="flex items-center gap-4">
             <div className="bg-purple-100 p-2.5 rounded-xl flex items-center justify-center">
               <MonitorSmartphone className="w-5 h-5 text-purple-600" />
             </div>
             <div className="flex flex-col text-left">
                 <span className="text-gray-900 font-semibold text-[17px]">Pair Senior Tablet</span>
                 <span className="text-[12px] font-medium text-purple-600/70 mt-0.5">Link a new device for Mom</span>
             </div>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400" />
        </Link>
      </section>
    </div>
  );
}
