"use client";

import { User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

export default function AccountSettingsPage() {
  const { data: session } = authClient.useSession();
  const { supporterName, seniorDisplayName } = useFamilySpaceProfile();

  return (
    <div className="flex w-full flex-col gap-6 px-4">
      <div className="mb-2 flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
          <User className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="font-headline text-sm font-semibold text-gray-700">
            Supporter Name
          </label>
          <input
            type="text"
            readOnly
            value={supporterName}
            className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 text-base font-medium outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="font-headline text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            readOnly
            value={session?.user?.email ?? ""}
            className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 text-base font-medium outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="font-headline text-sm font-semibold text-gray-700">
            FamilySpace
          </label>
          <input
            type="text"
            readOnly
            value={seniorDisplayName}
            className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 text-base font-medium outline-none"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-base leading-relaxed text-blue-900">
        Secure account editing will be enabled after re-authentication and audit logging land in the next sprint.
      </div>
    </div>
  );
}
