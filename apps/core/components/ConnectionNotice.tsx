"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useConvexConnectionState } from "convex/react";

function subscribeToNetworkChanges(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

const getNetworkStatus = () => navigator.onLine;
const getServerNetworkStatus = () => true;

export default function ConnectionNotice({
  companion = false,
}: {
  companion?: boolean;
}) {
  const { isWebSocketConnected } = useConvexConnectionState();
  const isOnline = useSyncExternalStore(
    subscribeToNetworkChanges,
    getNetworkStatus,
    getServerNetworkStatus,
  );
  const isConnected = isOnline && isWebSocketConnected;
  const [showNotice, setShowNotice] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setShowNotice(!isConnected),
      isConnected ? 0 : 3000,
    );
    return () => window.clearTimeout(timer);
  }, [isConnected]);
  if (!showNotice || isConnected) return null;
  return (
    <p
      role="status"
      className={`connection-notice${companion ? " connection-notice-companion" : ""}`}
    >
      Reconnecting to Memvella. Some information may be out of date.
    </p>
  );
}
