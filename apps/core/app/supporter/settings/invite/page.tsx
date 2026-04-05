"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ClipboardCopy,
  Loader2,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/components/ui/ToastProvider";
import { FormCard } from "@/components/ui/FormCard";
import { PrimaryButton } from "@/components/ui/Button";

function formatExpiryLabel(expiresAt: number) {
  const minutesRemaining = Math.max(1, Math.ceil((expiresAt - Date.now()) / 60000));
  const timeLabel = new Date(expiresAt).toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `Expires in about ${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"} at ${timeLabel}.`;
}

export default function InviteMemberPage() {
  const { toast } = useToast();
  const activeInvites = useQuery(api.familyInvites.listActiveMemberInvites);
  const generateMemberInviteCode = useMutation(
    api.familyInvites.generateMemberInviteCode,
  );
  const revokeActiveMemberInvites = useMutation(
    api.familyInvites.revokeActiveMemberInvites,
  );

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteExpiresAt, setInviteExpiresAt] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeInvite = activeInvites?.[0] ?? null;
  const displayedExpiresAt = inviteExpiresAt ?? activeInvite?.expiresAt ?? null;
  const hasVisibleCode = inviteCode !== null;
  const hasActiveInvite = displayedExpiresAt !== null;

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const result = await generateMemberInviteCode({});
      setInviteCode(result.inviteCode);
      setInviteExpiresAt(result.expiresAt);
      setCopied(false);
      toast({
        tone: "success",
        title: "Invite code ready",
        description: "Share the 6-digit code before it expires.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Invite code not created",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async () => {
    setIsRevoking(true);

    try {
      const result = await revokeActiveMemberInvites({});
      setInviteCode(null);
      setInviteExpiresAt(null);
      setCopied(false);
      toast({
        tone: result.revokedCount > 0 ? "success" : "info",
        title: result.revokedCount > 0 ? "Invite revoked" : "No active invite",
        description:
          result.revokedCount > 0
            ? "The current member invite is no longer active."
            : "There was no active member invite to revoke.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Invite not revoked",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast({
        tone: "success",
        title: "Invite code copied",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Invite code not copied",
        description:
          error instanceof Error
            ? error.message
            : "Copy the code manually instead.",
      });
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
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Create a short-lived 6-digit code so someone can join this Circle as a
          member.
        </p>
      </div>

      <FormCard className="mt-4 overflow-hidden border-2 border-purple-100 p-0">
        <div className="bg-purple-50/50 p-6 md:p-8">
          {!hasActiveInvite ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                <UserPlus className="h-8 w-8 text-purple-600" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 font-headline text-xl font-bold text-gray-900">
                Generate an Invite Code
              </h3>
              <p className="mb-8 max-w-sm text-gray-600">
                Share this secure 6-digit code with your family member. It expires in
                10 minutes and can only be used once.
              </p>

              <PrimaryButton
                onClick={handleGenerate}
                disabled={isGenerating || activeInvites === undefined}
                className="w-full max-w-xs"
              >
                {isGenerating || activeInvites === undefined ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Create Code"
                )}
              </PrimaryButton>
            </div>
          ) : hasVisibleCode ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <h3 className="mb-2 font-headline text-lg font-semibold uppercase tracking-widest text-gray-600">
                Active Code
              </h3>

              <p className="text-sm font-medium text-purple-700">
                {formatExpiryLabel(displayedExpiresAt)}
              </p>

              <div className="my-6 w-full max-w-xs rounded-3xl border border-gray-100 bg-white px-8 py-6 shadow-sm">
                <div className="font-mono text-5xl font-extrabold tracking-widest text-[#4e0078]">
                  {inviteCode}
                </div>
              </div>

              <button
                type="button"
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

              <div className="mb-6 flex w-full flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 text-left">
                <p className="text-sm font-semibold text-gray-900">How to use this code:</p>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-600">
                  <li>Ask your member to open Memvella on their phone.</li>
                  <li>
                    They select <strong className="text-gray-900">Join a Circle</strong>.
                  </li>
                  <li>They sign in and enter this 6-digit code.</li>
                </ol>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  Generate new code
                </button>
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={isRevoking}
                  className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                >
                  {isRevoking ? "Revoking..." : "Revoke code"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <h3 className="mb-2 font-headline text-lg font-semibold uppercase tracking-widest text-gray-600">
                Invite Active
              </h3>

              <p className="max-w-sm text-gray-600">
                A member invite is already active for this Circle. For security, the
                plaintext code is only shown when it is generated.
              </p>

              <div className="my-6 w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-6 py-5 text-left shadow-sm">
                <p className="text-sm font-semibold text-gray-900">Current status</p>
                <p className="mt-2 text-sm text-gray-600">
                  {formatExpiryLabel(displayedExpiresAt)}
                </p>
                <p className="mt-3 text-sm text-gray-600">
                  Generate a new code if you need to share it again. Doing that will
                  revoke the current invite.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <PrimaryButton onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate New Code"
                  )}
                </PrimaryButton>
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={isRevoking}
                  className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                >
                  {isRevoking ? "Revoking..." : "Revoke active invite"}
                </button>
              </div>
            </div>
          )}
        </div>
      </FormCard>
    </div>
  );
}
