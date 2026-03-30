"use client";

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Toggle from '@/components/Toggle';
import { Loader2 } from 'lucide-react';

export default function NotificationsSettingsPage() {
  const friendName = "your friend"; // TODO: wire to Convex profile
  
  const settings = useQuery(api.caregiver.getNotificationSettings);
  const updateSettings = useMutation(api.caregiver.updateNotificationSettings);

  // While the query is loading, derive safe defaults
  const dailySummary = settings?.dailySummary ?? true;
  const urgentAlerts = settings?.urgentAlerts ?? true;
  const routineReminders = settings?.routineReminders ?? false;

  const handleToggle = async (field: 'dailySummary' | 'urgentAlerts' | 'routineReminders') => {
    await updateSettings({
      dailySummary: field === 'dailySummary' ? !dailySummary : dailySummary,
      urgentAlerts: field === 'urgentAlerts' ? !urgentAlerts : urgentAlerts,
      routineReminders: field === 'routineReminders' ? !routineReminders : routineReminders,
    });
  };

  // Loading skeleton
  if (settings === undefined) {
    return (
      <div className="flex flex-col gap-6 px-4 w-full items-center justify-center pt-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 w-full">
      <p className="text-gray-500 text-sm">
        Choose which Memvella activities alert your personal device.
      </p>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50">

        <div className="flex items-center justify-between p-5">
          <div className="flex flex-col pr-4">
            <label htmlFor="daily_summary" className="font-headline font-bold text-gray-900 text-base cursor-pointer">Daily Summary</label>
            <span className="text-sm text-gray-500 mt-0.5 leading-snug">Get an evening wrap-up of {friendName}&apos;s day and any new insights.</span>
          </div>
          <Toggle checked={dailySummary} onChange={() => handleToggle('dailySummary')} />
        </div>

        <div className="flex items-center justify-between p-5">
          <div className="flex flex-col pr-4">
            <label htmlFor="urgent_alerts" className="font-headline font-bold text-gray-900 text-base cursor-pointer">Urgent Alerts</label>
            <span className="text-sm text-gray-500 mt-0.5 leading-snug">Immediate notifications if Memvella detects an emergency or confusion.</span>
          </div>
          <Toggle checked={urgentAlerts} onChange={() => handleToggle('urgentAlerts')} />
        </div>

        <div className="flex items-center justify-between p-5">
          <div className="flex flex-col pr-4">
            <label htmlFor="routine_reminders" className="font-headline font-bold text-gray-900 text-base cursor-pointer">Routine Reminders</label>
            <span className="text-sm text-gray-500 mt-0.5 leading-snug">Ping you when {friendName} completes or misses a scheduled routine.</span>
          </div>
          <Toggle checked={routineReminders} onChange={() => handleToggle('routineReminders')} />
        </div>

      </section>
    </div>
  );
}
