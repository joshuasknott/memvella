"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Camera, Heart, Mic, UserPlus, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

function MemberSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm animate-pulse">
      <div className="h-12 w-12 shrink-0 rounded-full bg-gray-100" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 rounded bg-gray-100" />
        <div className="h-3 w-20 rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default function SupporterMemoriesPage() {
  const { seniorDisplayName } = useFamilySpaceProfile();
  const members = useQuery(api.supporter.getFamilyDirectory);

  return (
    <div className="flex w-full flex-col gap-6 px-4">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-gray-900">
          Family Directory
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Manage the people and stories that shape {seniorDisplayName}&apos;s FamilySpace.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4">
        <Link
          href="/supporter/add-person"
          className="flex flex-col items-start gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-transform active:scale-95"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <UserPlus className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-bold text-gray-900">
              Add Person
            </span>
            <span className="mt-1 text-sm font-medium text-gray-500">
              Family and Friends
            </span>
          </div>
        </Link>

        <div className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-transform active:scale-95">
          <Link href="/supporter/add-memory" className="absolute inset-0 z-0" />

          <div className="pointer-events-none flex w-full items-start justify-between">
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Camera className="h-6 w-6" />
            </div>

            <Link
              href="/supporter/add-memory/voice"
              className="pointer-events-auto relative z-20 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 shadow-sm transition-colors active:scale-95 hover:bg-purple-200"
            >
              <Mic className="h-5 w-5" />
            </Link>
          </div>

          <div className="pointer-events-none relative z-10 mt-auto flex w-full flex-col">
            <span className="font-headline text-lg font-bold text-gray-900">
              Add Memory
            </span>
            <span className="mt-1 text-sm font-medium text-gray-500">
              Photos and Stories
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="font-headline text-xl font-bold text-gray-900">
            Connections
          </h2>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-bold uppercase tracking-[0.2em] text-primary">
            {members === undefined ? "..." : `${members.length} Added`}
          </span>
        </div>

        {members === undefined ? (
          <div className="space-y-3">
            <MemberSkeleton />
            <MemberSkeleton />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-purple-100 bg-purple-50/30 p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <Users className="h-7 w-7 text-purple-400" />
            </div>
            <p className="mb-2 font-headline text-lg font-bold text-gray-900">
              No connections yet
            </p>
            <p className="mb-6 max-w-[240px] text-base leading-relaxed text-gray-500">
              Add family and friends so Memvella can recognize them in stories and photos.
            </p>
            <Link
              href="/supporter/add-person"
              className="rounded-full bg-[#1D4ED8] px-8 py-4 text-base font-bold text-white shadow-md transition-transform active:scale-95"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:border-purple-200"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-purple-100 bg-purple-50">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-headline text-lg font-bold text-purple-400">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-headline text-lg font-bold leading-tight text-gray-900">
                    {member.name}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    {member.relationship}
                  </p>
                </div>

                <div className="shrink-0">
                  {member.isLiving ? (
                    <Heart className="h-5 w-5 fill-purple-100 text-purple-400" />
                  ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-400">
                      In Memory
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
