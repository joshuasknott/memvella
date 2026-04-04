"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ClipboardCopy, Loader2, RefreshCw, UserPlus } from "lucide-react";
import { FormCard } from "@/components/ui/FormCard";
import { PrimaryButton } from "@/components/ui/Button";

// Mock helper to generate a random 6 digit string
const generateMockCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default function InviteMemberPage() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // In a real implementation, this would call a Convex mutation:
  // const createInvite = useMutation(api.invites.create);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setInviteCode(generateMockCode());
    setCopied(false);
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-12">
      <div className="mb-2">
        <Link
          href="/supporter/settings"
          className="inline-flex items-center gap-2 font-semibold text-[#4e0078] transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back to Settings
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-[#4e0078]">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-gray-900">
            Invite a Member
          </h1>
        </div>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          As an Organiser, you can invite family members to join this Circle. They will be able to see updates, view memories, and add people.
        </p>
      </div>

      <FormCard className="mt-4 overflow-hidden border-2 border-purple-100 p-0">
        <div className="bg-purple-50/50 p-6 md:p-8">
          {!inviteCode ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                <UserPlus className="h-8 w-8 text-purple-600" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 font-headline text-xl font-bold text-gray-900">
                Generate an Invite Code
              </h3>
              <p className="mb-8 max-w-sm text-gray-600">
                Share this secure 6-digit code with your family member. It expires in 15 minutes.
              </p>
              
              <PrimaryButton
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full max-w-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Create Code"
                )}
              </PrimaryButton>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <h3 className="mb-2 font-headline text-lg font-semibold text-gray-600 uppercase tracking-widest">
                Active Code
              </h3>
              
              <div className="my-6 rounded-3xl bg-white px-8 py-6 shadow-sm border border-gray-100 w-full max-w-xs">
                <div className="font-mono text-5xl font-extrabold tracking-widest text-[#4e0078]">
                  {inviteCode}
                </div>
              </div>

              <button
                onClick={handleCopy}
                className={`mb-8 flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-all ${
                  copied 
                    ? "bg-green-100 text-green-700"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5" /> Code Copied!
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="h-5 w-5" /> Copy Code
                  </>
                )}
              </button>

              <div className="mb-6 flex w-full flex-col gap-2 rounded-2xl bg-white p-5 text-left border border-gray-100">
                <p className="text-sm font-semibold text-gray-900">How to use this code:</p>
                <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
                  <li>Ask your Member to go to Memvella on their phone.</li>
                  <li>They select <strong className="text-gray-900">Join a Circle</strong>.</li>
                  <li>They enter this 6-digit code when asked.</li>
                </ol>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                Generate new code
              </button>
            </div>
          )}
        </div>
      </FormCard>
    </div>
  );
}
