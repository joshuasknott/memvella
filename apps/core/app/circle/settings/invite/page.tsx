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
import { PrimaryButton } from "@memvella/ui";
import { useCircleProfile } from "@/lib/use-circle-profile";

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
  const { isOrganiser } = useCircleProfile();
  const activeInvites = useQuery(
    api.circleInvites.listActiveMemberInvites,
    isOrganiser ? undefined : "skip",
  );
  const generateMemberInviteCode = useMutation(
    api.circleInvites.generateMemberInviteCode,
  );
  const revokeActiveMemberInvites = useMutation(
    api.circleInvites.revokeActiveMemberInvites,
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

  if (!isOrganiser) {
    return (
      <div className="flex w-full flex-col gap-6 px-4 pb-12">
        <div className="mb-2">
          <Link
            href="/circle/settings"
            className="inline-flex items-center gap-2 font-semibold text-family-primary transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back to Settings
          </Link>
        </div>

        <FormCard className="text-center">
          <div data-testid="invite-settings-restricted">
            <h1 className="font-family text-3xl font-extrabold tracking-tight text-text-primary">
              Invite Codes
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-text-secondary">
              Only the Organiser can create or revoke invite codes for this Circle.
            </p>
          </div>
        </FormCard>
      </div>
    );
  }

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
          href="/circle/settings"
          className="inline-flex items-center gap-2 font-semibold text-family-primary transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back to Settings
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-family-primary/15 text-family-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <h1 className="font-family text-3xl font-extrabold tracking-tight text-text-primary">
            Invite a Member
          </h1>
        </div>
        <p className="mt-4 text-lg leading-relaxed text-text-secondary">
          Create a short-lived 6-digit code so someone can join this Circle as a
          member.
        </p>
      </div>

      <FormCard className="mt-4 overflow-hidden border-2 border-family-primary/15 p-0">
        <div className="bg-family-primary/5 p-6 md:p-8">
          {!hasActiveInvite ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface shadow-sm">
                <UserPlus className="h-8 w-8 text-family-primary/80" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 font-family text-lg font-bold text-text-primary">
                Generate an Invite Code
              </h3>
              <p className="mb-8 max-w-sm text-text-secondary">
                Share this secure 6-digit code with your family member. It expires in
                10 minutes and can only be used once.
              </p>

              <PrimaryButton
                onClick={handleGenerate}
                disabled={isGenerating || activeInvites === undefined}
                className="w-full max-w-xs"
                data-testid="generate-invite-code-button"
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
              <h3 className="mb-2 font-family text-lg font-semibold uppercase tracking-widest text-text-secondary">
                Active Code
              </h3>

              <p className="text-sm font-medium text-family-primary/80">
                {formatExpiryLabel(displayedExpiresAt)}
              </p>

              <div className="my-6 w-full max-w-xs rounded-xl border border-border bg-surface px-8 py-6 shadow-sm">
                <div
                  className="font-mono text-5xl font-extrabold tracking-widest text-family-primary"
                  data-testid="active-invite-code"
                >
                  {inviteCode}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className={`mb-8 flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-all ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-family-primary/15 text-family-primary/80 hover:bg-family-primary/20"
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

              <div className="mb-6 flex w-full flex-col gap-2 rounded-xl border border-border bg-surface p-5 text-left">
                <p className="text-sm font-semibold text-text-primary">How to use this code:</p>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-text-secondary">
                  <li>Ask your member to open Memvella on their phone.</li>
                  <li>
                    They select <strong className="text-text-primary">Join a Circle</strong>.
                  </li>
                  <li>They sign in and enter this 6-digit code.</li>
                </ol>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  data-testid="regenerate-invite-code-button"
                  className="flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  Generate new code
                </button>
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={isRevoking}
                  data-testid="revoke-invite-code-button"
                  className="text-sm font-semibold text-status-alert transition-colors hover:text-red-700"
                >
                  {isRevoking ? "Revoking..." : "Revoke code"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <h3 className="mb-2 font-family text-lg font-semibold uppercase tracking-widest text-text-secondary">
                Invite Active
              </h3>

              <p className="max-w-sm text-text-secondary">
                A member invite is already active for this Circle. For security, the
                plaintext code is only shown when it is generated.
              </p>

              <div className="my-6 w-full max-w-sm rounded-xl border border-border bg-surface px-6 py-5 text-left shadow-sm">
                <p className="text-sm font-semibold text-text-primary">Current status</p>
                <p className="mt-2 text-sm text-text-secondary">
                  {formatExpiryLabel(displayedExpiresAt)}
                </p>
                <p className="mt-3 text-sm text-text-secondary">
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
                  className="text-sm font-semibold text-status-alert transition-colors hover:text-red-700"
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
