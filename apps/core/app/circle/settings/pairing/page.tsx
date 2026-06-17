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
import { api } from "@memvella/backend";
import type { Id } from "@memvella/backend/dataModel";
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
    api.sessions.listAssistedDeviceSessions,
    isOrganiser ? undefined : "skip",
  );
  const generatePin = useMutation(api.kiosk.generateKioskPin);
  const deactivate = useMutation(api.kiosk.deactivateKioskDevice);
  const revokeSession = useMutation(api.sessions.revokeAssistedDeviceSession);

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
        <section className="rounded-xl border border-family-primary/15 bg-surface p-6 shadow-sm">
          <div data-testid="pairing-settings-restricted">
            <h1 className="font-family text-3xl font-extrabold tracking-tight text-text-primary">
              Companion tablet
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-text-secondary">
              Only the Workspace owner can connect or revoke companion tablets.
            </p>
          </div>
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
        title: "Tablet code ready",
        description: `Enter this 6-digit tablet code on the companion tablet for ${seniorDisplayName}.`,
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Tablet code was not generated",
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
        title: "Companion tablet access cleared",
        description: "All outstanding tablet codes and active companion tablet sessions were revoked.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Companion tablet access did not clear",
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
        title: "Companion tablet session revoked",
        description: "That tablet needs a new tablet code before it can reopen the companion.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Companion tablet session did not revoke",
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
      <section className="rounded-xl border border-family-primary/15 bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-primary">
              Companion tablet
            </p>
            <h1 className="mt-2 font-family text-3xl font-extrabold tracking-tight text-text-primary">
              Tablet access
            </h1>
            <p className="mt-2 text-lg leading-relaxed text-text-secondary">
              Generate a secure tablet code for {seniorDisplayName} and manage every active companion tablet session linked to this Workspace.
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-family-primary/10 text-family-primary">
            <MonitorSmartphone className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-6 rounded-xl border-2 border-dashed border-family-primary/20 bg-surface-muted p-8 text-center">
          {formattedPin ? (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-family-primary">
                Active code
              </p>
              <p
                className="mt-4 font-mono text-4xl font-bold tracking-[0.2em] text-family-primary"
                data-testid="active-pairing-code"
              >
                {formattedPin}
              </p>
              {pinExpiresAt ? (
                <p className="mt-3 text-sm font-medium text-text-secondary">
                  Expires {formatDateTime(pinExpiresAt)}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-text-tertiary">
                Ready to connect
              </p>
              <p className="mt-4 text-lg font-medium text-text-secondary">
                Generate a fresh 6-digit tablet code to connect the companion tablet.
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
            data-testid="generate-pairing-code-button"
            className="flex min-h-[64px] flex-1 items-center justify-center gap-2 rounded-full bg-senior-primary px-6 text-base font-semibold text-white shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="flex min-h-[64px] flex-1 items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 text-base font-semibold text-text-secondary shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-family-accent/10 text-family-accent">
            <ShieldOff className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-family text-lg font-bold text-text-primary">
              Active companion tablets
            </h2>
            <p className="mt-2 text-base leading-relaxed text-text-secondary">
              Revoke an individual tablet if it is replaced, shared, or no longer trusted.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {assistedSessions === undefined ? (
            <div className="flex items-center justify-center rounded-xl bg-surface-muted px-4 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-family-primary/50" />
            </div>
          ) : assistedSessions.length === 0 ? (
            <div className="rounded-xl bg-surface-muted px-4 py-4 text-sm font-medium text-text-secondary">
              No active companion tablet sessions are connected right now.
            </div>
          ) : (
            assistedSessions.map(
              (sessionItem: NonNullable<typeof assistedSessions>[number]) => (
                <div
                  key={sessionItem.id}
                  className="rounded-xl border border-border bg-surface-muted px-4 py-4"
                >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-family-accent shadow-sm">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-text-primary">
                        Companion tablet
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        Last active {formatDateTime(sessionItem.lastValidatedAt)}
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
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
                    data-testid={`revoke-assisted-session-${sessionItem.id}`}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-surface-inverse px-4 text-sm font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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
