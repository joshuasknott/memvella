"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import {
  clearSeniorSession,
  loadSeniorSession,
  type SeniorExperience,
  type SeniorSessionState,
} from "@/lib/senior-session-client";

export function useSeniorDashboardSession(experience: SeniorExperience) {
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SeniorSessionState | null>(null);
  const keepSessionAlive = useMutation(api.seniorAccess.keepSessionAlive);

  useEffect(() => {
    setSessionState(loadSeniorSession(experience));
    void getDeviceFingerprint(experience).then(setDeviceFingerprint);
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
