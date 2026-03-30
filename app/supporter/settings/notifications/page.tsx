"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Bell, Loader2, Smartphone, ShieldCheck } from "lucide-react";
import Toggle from "@/components/Toggle";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/convex/_generated/api";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";
import {
  getCurrentDeviceLabel,
  getCurrentPushSubscription,
  isPushNotificationsSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/lib/push-notifications";

function formatTimeLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const hourLabel = hours % 12 === 0 ? 12 : hours % 12;
  return `${hourLabel}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatLastSeenLabel(timestamp: number | null) {
  if (!timestamp) {
    return "Recently connected";
  }

  return new Date(timestamp).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsSettingsPage() {
  const { seniorDisplayName } = useFamilySpaceProfile();
  const { toast } = useToast();
  const settings = useQuery(api.notifications.getSupporterNotificationSettings);
  const updateSettings = useMutation(api.notifications.updateSupporterNotificationSettings);
  const upsertPushSubscription = useMutation(api.notifications.upsertPushSubscription);
  const revokePushSubscription = useMutation(api.notifications.revokePushSubscription);

  const [isPushBusy, setIsPushBusy] = useState(false);
  const [isSettingsBusy, setIsSettingsBusy] = useState(false);
  const [currentSubscriptionEndpoint, setCurrentSubscriptionEndpoint] = useState<string | null>(null);

  const pushSupported = useMemo(() => isPushNotificationsSupported(), []);
  const pushConfigured = Boolean(
    process.env.NEXT_PUBLIC_MEMVELLA_WEB_PUSH_PUBLIC_KEY,
  );

  useEffect(() => {
    if (!pushSupported) {
      return;
    }

    void getCurrentPushSubscription()
      .then((subscription) => {
        setCurrentSubscriptionEndpoint(subscription?.endpoint ?? null);
      })
      .catch(() => {
        setCurrentSubscriptionEndpoint(null);
      });
  }, [pushSupported]);

  const dailySummary = settings?.dailySummary ?? true;
  const urgentAlerts = settings?.urgentAlerts ?? true;
  const routineReminders = settings?.routineReminders ?? false;
  const summaryTimeLabel = formatTimeLabel(
    settings?.dailySummaryTimeMinutes ?? 19 * 60,
  );

  const handleToggle = async (
    field: "dailySummary" | "urgentAlerts" | "routineReminders",
  ) => {
    if (!settings) {
      return;
    }

    setIsSettingsBusy(true);
    try {
      await updateSettings({
        dailySummary: field === "dailySummary" ? !dailySummary : dailySummary,
        urgentAlerts: field === "urgentAlerts" ? !urgentAlerts : urgentAlerts,
        routineReminders:
          field === "routineReminders" ? !routineReminders : routineReminders,
        dailySummaryTimeMinutes: settings.dailySummaryTimeMinutes,
      });
      toast({
        tone: "success",
        title: "Notification settings updated",
        description: "Your Supporter alert preferences are now saved.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Notification settings did not save",
        description:
          error instanceof Error
            ? error.message
            : "Please try that change again.",
      });
    } finally {
      setIsSettingsBusy(false);
    }
  };

  const handleEnablePush = async () => {
    setIsPushBusy(true);
    try {
      const { permissionState, subscription } = await subscribeToPushNotifications();
      await upsertPushSubscription({
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: subscription.keys,
        deviceLabel: getCurrentDeviceLabel(),
        userAgent: navigator.userAgent,
        permissionState,
      });
      setCurrentSubscriptionEndpoint(subscription.endpoint);
      toast({
        tone: "success",
        title: "Push alerts enabled",
        description: "This Supporter device will now receive FamilySpace alerts.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Push alerts were not enabled",
        description:
          error instanceof Error
            ? error.message
            : "Check your browser permissions and try again.",
      });
    } finally {
      setIsPushBusy(false);
    }
  };

  const handleDisablePush = async () => {
    setIsPushBusy(true);
    try {
      const existingSubscription = await getCurrentPushSubscription();
      const { endpoint } = await unsubscribeFromPushNotifications();
      const revokedEndpoint = existingSubscription?.endpoint ?? endpoint;

      if (revokedEndpoint) {
        await revokePushSubscription({ endpoint: revokedEndpoint });
      }

      setCurrentSubscriptionEndpoint(null);
      toast({
        tone: "success",
        title: "Push alerts disabled",
        description: "This Supporter device will stop receiving push alerts.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Push alerts were not disabled",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setIsPushBusy(false);
    }
  };

  if (settings === undefined) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 pt-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-8">
      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">
              Device Alerts
            </p>
            <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-gray-900">
              Notifications
            </h1>
            <p className="mt-2 text-lg leading-relaxed text-gray-600">
              Manage the alerts that reach your Supporter devices for {seniorDisplayName}&apos;s FamilySpace.
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
            <Bell className="h-7 w-7" />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-800">
            <Smartphone className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-headline text-xl font-bold text-gray-900">
              This device
            </h2>
            <p className="mt-1 text-base leading-relaxed text-gray-600">
              Turn browser push alerts on or off for the current Supporter device.
            </p>
            {!pushConfigured ? (
              <p className="mt-3 rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-900">
                Push alerts are not configured for this deployment yet.
              </p>
            ) : !pushSupported ? (
              <p className="mt-3 rounded-2xl bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-900">
                This browser does not support push alerts.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4">
          <div>
            <p className="text-base font-bold text-gray-900">
              {currentSubscriptionEndpoint ? "Push alerts enabled" : "Push alerts disabled"}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {currentSubscriptionEndpoint
                ? "Routine reminders, urgent alerts, and daily summaries can reach this device."
                : "Enable push alerts to receive routine reminders and summaries here."}
            </p>
          </div>
          <button
            type="button"
            onClick={currentSubscriptionEndpoint ? handleDisablePush : handleEnablePush}
            disabled={isPushBusy || !pushConfigured || !pushSupported}
            className={`inline-flex min-h-[56px] items-center justify-center rounded-full px-5 text-base font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
              currentSubscriptionEndpoint ? "bg-slate-900" : "bg-[#6B21A8]"
            }`}
          >
            {isPushBusy ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Updating...
              </>
            ) : currentSubscriptionEndpoint ? (
              "Disable"
            ) : (
              "Enable"
            )}
          </button>
        </div>
      </section>

      <section className="divide-y divide-gray-100 rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="pr-4">
            <label
              htmlFor="daily_summary"
              className="font-headline text-lg font-bold text-gray-900"
            >
              Daily summary
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Evening recap around {summaryTimeLabel} with queued insights and the next FamilySpace routine.
            </p>
          </div>
          <Toggle
            checked={dailySummary}
            onChange={() => {
              void handleToggle("dailySummary");
            }}
            disabled={isSettingsBusy}
          />
        </div>

        <div className="flex items-center justify-between gap-4 p-5">
          <div className="pr-4">
            <label
              htmlFor="urgent_alerts"
              className="font-headline text-lg font-bold text-gray-900"
            >
              Urgent alerts
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Immediate Supporter notifications when Memvella detects distress markers in a FamilySpace voice session.
            </p>
          </div>
          <Toggle
            checked={urgentAlerts}
            onChange={() => {
              void handleToggle("urgentAlerts");
            }}
            disabled={isSettingsBusy}
          />
        </div>

        <div className="flex items-center justify-between gap-4 p-5">
          <div className="pr-4">
            <label
              htmlFor="routine_reminders"
              className="font-headline text-lg font-bold text-gray-900"
            >
              Routine reminders
            </label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Alerts before {seniorDisplayName}&apos;s scheduled FamilySpace routines begin.
            </p>
          </div>
          <Toggle
            checked={routineReminders}
            onChange={() => {
              void handleToggle("routineReminders");
            }}
            disabled={isSettingsBusy}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-headline text-xl font-bold text-gray-900">
              Connected Supporter devices
            </h2>
            <p className="mt-1 text-base leading-relaxed text-gray-600">
              {settings.activeSubscriptions.length} device
              {settings.activeSubscriptions.length === 1 ? "" : "s"} currently linked for push alerts.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {settings.activeSubscriptions.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600">
              No Supporter devices are subscribed for push alerts yet.
            </div>
          ) : (
            settings.activeSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="rounded-2xl border border-gray-100 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-gray-900">
                      {subscription.deviceLabel}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Last seen {formatLastSeenLabel(subscription.lastSeenAt)}
                    </p>
                  </div>
                  {subscription.lastDeliveryAt ? (
                    <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-blue-800">
                      Delivered
                    </span>
                  ) : null}
                </div>
                {currentSubscriptionEndpoint ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.15em] text-purple-800">
                    {subscription.failureCount > 0
                      ? `${subscription.failureCount} recent delivery issue${subscription.failureCount === 1 ? "" : "s"}`
                      : "Active push route"}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
