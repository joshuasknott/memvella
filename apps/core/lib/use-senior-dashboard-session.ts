"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@memvella/backend";
import {
  getDeviceFingerprint,
  persistDeviceFingerprint,
} from "@/lib/device-fingerprint";
import {
  clearSeniorSession,
  loadSeniorSession,
  type SeniorExperience,
  type SeniorSessionState,
} from "@/lib/senior-session-client";

export function useSeniorDashboardSession(experience: SeniorExperience) {
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(
    null,
  );
  const [sessionState, setSessionState] = useState<SeniorSessionState | null>(
    null,
  );
  const [isPreparing, setIsPreparing] = useState(true);
  const [preparationError, setPreparationError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const keepSessionAlive = useMutation(api.seniorAccess.keepSessionAlive);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const nextSession = loadSeniorSession(experience);
          if (!active) return;
          setSessionState(nextSession);
          if (!nextSession?.sessionToken) return;
          const fingerprint =
            nextSession.deviceFingerprint ??
            (await getDeviceFingerprint(experience));
          if (!active) return;
          persistDeviceFingerprint(experience, fingerprint);
          setDeviceFingerprint(fingerprint);
        } catch {
          if (active)
            setPreparationError(
              "This tablet couldn’t prepare its connection. Check your connection and allow this browser to store site data, then try again.",
            );
        } finally {
          if (active) setIsPreparing(false);
        }
      })();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [experience, attempt]);

  const clearSession = useCallback(() => {
    clearSeniorSession(experience);
    setSessionState(null);
  }, [experience]);

  const dashboard = useQuery(
    api.seniorAccess.getSeniorDashboard,
    sessionState?.sessionToken && deviceFingerprint
      ? {
          sessionToken: sessionState.sessionToken,
          deviceFingerprint,
        }
      : "skip",
  );

  useEffect(() => {
    if (!sessionState?.sessionToken || !deviceFingerprint) {
      return;
    }

    let active = true;
    let inFlight = false;
    const refresh = () => {
      if (inFlight) return;
      inFlight = true;
      void keepSessionAlive({
        sessionToken: sessionState.sessionToken,
        deviceFingerprint,
      })
        .then((result) => {
          if (active && result.status !== "active") {
            clearSession();
          }
        })
        .catch(() => {
          // A temporary service failure is not a revocation. Retry without losing pairing.
        })
        .finally(() => {
          inFlight = false;
        });
    };
    const intervalId = window.setInterval(refresh, 2 * 60 * 1000);
    window.addEventListener("online", refresh);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("online", refresh);
    };
  }, [
    clearSession,
    deviceFingerprint,
    keepSessionAlive,
    sessionState?.sessionToken,
  ]);

  return {
    deviceFingerprint,
    sessionState,
    dashboard,
    isPreparing,
    preparationError,
    clearSession,
    reloadSession: () => {
      setPreparationError(null);
      setIsPreparing(true);
      setAttempt((current) => current + 1);
    },
  };
}
