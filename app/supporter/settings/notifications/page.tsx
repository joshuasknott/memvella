"use client";

import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import Toggle from "@/components/Toggle";
import { api } from "@/convex/_generated/api";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

export default function NotificationsSettingsPage() {
  const { seniorDisplayName } = useFamilySpaceProfile();
  const settings = useQuery(api.supporter.getNotificationSettings);
  const updateSettings = useMutation(api.supporter.updateNotificationSettings);

  const dailySummary = settings?.dailySummary ?? true;
  const urgentAlerts = settings?.urgentAlerts ?? true;
  const routineReminders = settings?.routineReminders ?? false;

  const handleToggle = async (
    field: "dailySummary" | "urgentAlerts" | "routineReminders",
  ) => {
    await updateSettings({
      dailySummary: field === "dailySummary" ? !dailySummary : dailySummary,
      urgentAlerts: field === "urgentAlerts" ? !urgentAlerts : urgentAlerts,
      routineReminders:
        field === "routineReminders" ? !routineReminders : routineReminders,
    });
  };

  if (settings === undefined) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 pt-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4">
      <p className="text-lg text-gray-500">
        Choose which Memvella activities alert your personal device.
      </p>

      <section className="divide-y divide-gray-50 rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between p-5">
          <div className="flex flex-col pr-4">
            <label
              htmlFor="daily_summary"
              className="cursor-pointer font-headline text-lg font-bold text-gray-900"
            >
              Daily Summary
            </label>
            <span className="mt-1 text-sm leading-snug text-gray-500">
              Get an evening wrap-up of {seniorDisplayName}&apos;s day and any new insights.
            </span>
          </div>
          <Toggle checked={dailySummary} onChange={() => handleToggle("dailySummary")} />
        </div>

        <div className="flex items-center justify-between p-5">
          <div className="flex flex-col pr-4">
            <label
              htmlFor="urgent_alerts"
              className="cursor-pointer font-headline text-lg font-bold text-gray-900"
            >
              Urgent Alerts
            </label>
            <span className="mt-1 text-sm leading-snug text-gray-500">
              Immediate notifications if Memvella detects a high-risk moment or distress.
            </span>
          </div>
          <Toggle checked={urgentAlerts} onChange={() => handleToggle("urgentAlerts")} />
        </div>

        <div className="flex items-center justify-between p-5">
          <div className="flex flex-col pr-4">
            <label
              htmlFor="routine_reminders"
              className="cursor-pointer font-headline text-lg font-bold text-gray-900"
            >
              Routine Reminders
            </label>
            <span className="mt-1 text-sm leading-snug text-gray-500">
              Alert me when {seniorDisplayName} completes or misses a scheduled routine.
            </span>
          </div>
          <Toggle
            checked={routineReminders}
            onChange={() => handleToggle("routineReminders")}
          />
        </div>
      </section>
    </div>
  );
}
