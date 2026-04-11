"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  Loader2,
  MonitorSmartphone,
  RefreshCw,
  ShieldOff,
  Smartphone,
  WifiOff,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCircleProfile } from "@/lib/use-circle-profile";

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PairingSettingsPage() {
  const { toast } = useToast();
  const { seniorDisplayName, isOrganiser } = useCircleProfile();
  const assistedSessions = useQuery(
    api.organiser.listAssistedDeviceSessions,
    isOrganiser ? undefined : "skip",
  );
  const generatePin = useMutation(api.kiosk.generateKioskPin);
  const deactivate = useMutation(api.kiosk.deactivateKioskDevice);
  const revokeSession = useMutation(api.organiser.revokeAssistedDeviceSession);

  const [pin, setPin] = useState<string | null>(null);
  const [pinExpiresAt, setPinExpiresAt] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  const formattedPin = useMemo(
    () => (pin ? `${pin.slice(0, 3)}-${pin.slice(3)}` : null),
    [pin],
  );

  if (!isOrganiser) {
    return (
      <div className="flex w-full flex-col gap-6 px-4 pb-8">
        <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-gray-900">
            Tablet Access
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Only the Organiser can pair or revoke Tablet User devices for this Circle.
          </p>
        </section>
      </div>
    );
  }

  const handleGeneratePin = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePin({ seniorName: seniorDisplayName });
      setPin(result.pinCode);
      setPinExpiresAt(result.expiresAt);
      toast({
        tone: "success",
        title: "New pairing code generated",
        description: `Share the 6-digit code with ${seniorDisplayName} to connect the Tablet User device.`,
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Pairing code was not generated",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await deactivate({});
      setPin(null);
      setPinExpiresAt(null);
      toast({
        tone: "success",
        title: "Assisted device access cleared",
        description: "All outstanding pairing codes and active Tablet User device sessions were revoked.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Assisted device access did not clear",
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleRevokeSession = async (sessionId: Id<"seniorAccessSessions">) => {
    setRevokingSessionId(sessionId);
    try {
      await revokeSession({ sessionId });
      toast({
        tone: "success",
        title: "Assisted device session revoked",
        description: "That tablet must pair again before it can reopen the Circle.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Assisted device session did not revoke",
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });
    } finally {
      setRevokingSessionId(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-8">
      <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-800">
              Assisted device pairing
            </p>
            <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-gray-900">
              Pairing
            </h1>
            <p className="mt-2 text-lg leading-relaxed text-gray-600">
              Generate a secure pairing code for {seniorDisplayName} and manage every active Tablet User device session linked to this Circle.
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-800">
            <MonitorSmartphone className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border-2 border-dashed border-purple-200 bg-slate-50 p-8 text-center">
          {formattedPin ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-800">
                Active code
              </p>
              <p className="mt-4 font-mono text-4xl font-bold tracking-[0.2em] text-purple-800">
                {formattedPin}
              </p>
              {pinExpiresAt ? (
                <p className="mt-3 text-sm font-medium text-gray-600">
                  Expires {formatDateTime(pinExpiresAt)}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                Ready to pair
              </p>
              <p className="mt-4 text-lg font-medium text-slate-700">
                Generate a fresh 6-digit code to connect a tablet.
              </p>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              void handleGeneratePin();
            }}
            disabled={isGenerating}
            className="flex min-h-[64px] flex-1 items-center justify-center gap-2 rounded-full bg-[#6B21A8] px-6 text-base font-semibold text-white shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                {pin ? "Generate new code" : "Generate code"}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              void handleDeactivate();
            }}
            disabled={isDeactivating}
            className="flex min-h-[64px] flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 text-base font-semibold text-slate-700 shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeactivating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Revoking...
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5" />
                Revoke all access
              </>
            )}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
            <ShieldOff className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-headline text-2xl font-bold text-gray-900">
              Active Tablet User devices
            </h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600">
              Revoke an individual tablet if it is replaced, shared, or no longer trusted.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {assistedSessions === undefined ? (
            <div className="flex items-center justify-center rounded-2xl bg-slate-50 px-4 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
            </div>
          ) : assistedSessions.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600">
              No active Tablet User device sessions are connected right now.
            </div>
          ) : (
            assistedSessions.map(
              (sessionItem: NonNullable<typeof assistedSessions>[number]) => (
                <div
                  key={sessionItem.id}
                  className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-4"
                >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-800 shadow-sm">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-gray-900">
                        Tablet User device
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Last active {formatDateTime(sessionItem.lastValidatedAt)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Expires {formatDateTime(sessionItem.expiresAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void handleRevokeSession(sessionItem.id);
                    }}
                    disabled={revokingSessionId === sessionItem.id}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {revokingSessionId === sessionItem.id ? "Revoking..." : "Revoke"}
                  </button>
                </div>
                </div>
              ),
            )
          )}
        </div>
      </section>
    </div>
  );
}
