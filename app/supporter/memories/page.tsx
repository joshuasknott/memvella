"use client";

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { BookOpen, UserPlus, Camera, Users, Mic, Heart, Edit2, Trash2 } from 'lucide-react';

function MemberSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-28" />
        <div className="h-2.5 bg-gray-100 rounded w-20" />
      </div>
      <div className="w-5 h-5 rounded-full bg-gray-100" />
    </div>
  );
}

export default function SupporterMemoriesPage() {
  const members = useQuery(api.caregiver.getFamilyDirectory);
  const friendName = "your friend"; // TODO: wire to Convex profile

  const handleUpdate = (id: string, type: string) => {
    console.log(`Update ${type}: ${id}`);
  };

  const handleDelete = (id: string, type: string) => {
    console.log(`Delete ${type}: ${id}`);
  };

  return (
    <div className="flex flex-col gap-6 px-4 w-full">
      <div>
        <h1 className="font-headline font-extrabold text-3xl text-gray-900 tracking-tight">Family Directory</h1>
        <p className="text-gray-500 text-sm mt-2">Manage the people and stories in {friendName}&apos;s life.</p>
      </div>

      {/* Action Cards */}
      <section className="grid grid-cols-2 gap-4">
        <Link href="/supporter/add-person" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-start gap-4 transition-transform active:scale-95">
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
          <Link href="/supporter/add-memory" className="absolute inset-0 z-0"></Link>

          <div className="flex w-full justify-between items-start pointer-events-none">
            <div className="bg-purple-50 text-purple-600 rounded-full p-3 flex w-12 h-12 items-center justify-center relative z-10">
              <Camera className="w-6 h-6" />
            </div>

            {/* Floating Quick Mic action */}
            <Link
              href="/supporter/add-memory/voice"
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

      {/* Family Members — Live from Convex */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="font-headline font-bold text-xl text-gray-900">Connections</h2>
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase bg-purple-50 px-3 py-1 rounded-full">
            {members === undefined ? '…' : `${members.length} Added`}
          </span>
        </div>

        {/* Loading */}
        {members === undefined && (
          <div className="space-y-3">
            <MemberSkeleton />
            <MemberSkeleton />
          </div>
        )}

        {/* Empty state */}
        {members !== undefined && members.length === 0 && (
          <div className="bg-purple-50/30 rounded-3xl p-8 border border-purple-100 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
              <Users className="w-7 h-7 text-purple-400" />
            </div>
            <p className="font-headline font-bold text-gray-900 text-lg mb-2">No connections yet</p>
            <p className="text-gray-500 text-sm max-w-[220px] leading-relaxed mb-6">
              Add family and friends to help Memvella recognize them in stories and photos.
            </p>
            <Link
              href="/supporter/add-person"
              className="px-8 py-3.5 bg-linear-to-r from-[#1D4ED8] to-[#9333EA] text-white font-bold rounded-full shadow-md active:scale-95 transition-transform text-sm"
            >
              Get Started
            </Link>
          </div>
        )}

        {/* Member list */}
        {members !== undefined && members.length > 0 && (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 group hover:border-purple-200 transition-colors cursor-pointer">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-headline font-bold text-purple-400 text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-headline font-bold text-gray-900 text-base leading-tight truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{member.relationship}</p>
                </div>

                {/* Temporal safety indicator & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex group-hover:hidden items-center transition-all">
                    {member.isLiving ? (
                      <Heart className="w-5 h-5 text-purple-400 fill-purple-100" />
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        In Memory
                      </span>
                    )}
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1 animate-in fade-in duration-200">
                    <button onClick={(e) => { e.preventDefault(); handleUpdate(member.id, 'connection'); }} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); handleDelete(member.id, 'connection'); }} className="p-2 text-error hover:bg-error/10 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
