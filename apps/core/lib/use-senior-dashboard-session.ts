"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SeniorSessionState | null>(
    () =>
      typeof window === "undefined" ? null : loadSeniorSession(experience),
  );
  const keepSessionAlive = useMutation(api.seniorAccess.keepSessionAlive);

  useEffect(() => {
    const nextSession = loadSeniorSession(experience);
    const syncSessionId = window.setTimeout(() => {
      setSessionState(nextSession);
    }, 0);

    if (nextSession?.deviceFingerprint) {
      persistDeviceFingerprint(experience, nextSession.deviceFingerprint);
      const syncFingerprintId = window.setTimeout(() => {
        setDeviceFingerprint(nextSession.deviceFingerprint!);
      }, 0);
      return () => {
        window.clearTimeout(syncSessionId);
        window.clearTimeout(syncFingerprintId);
      };
    }

    void getDeviceFingerprint(experience).then(setDeviceFingerprint);
    return () => window.clearTimeout(syncSessionId);
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

    const intervalId = window.setInterval(() => {
      void keepSessionAlive({
        sessionToken: sessionState.sessionToken,
        deviceFingerprint,
      })
        .then((result) => {
          if (result.status !== "active") {
            clearSeniorSession(experience);
            setSessionState(null);
          }
        })
        .catch(() => {
          clearSeniorSession(experience);
          setSessionState(null);
        });
    }, 2 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [deviceFingerprint, experience, keepSessionAlive, sessionState?.sessionToken]);

  return {
    deviceFingerprint,
    sessionState,
    dashboard,
    clearSession: () => {
      clearSeniorSession(experience);
      setSessionState(null);
    },
    reloadSession: () => {
      setSessionState(loadSeniorSession(experience));
    },
  };
}
