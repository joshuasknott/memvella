"use client";

import { useState } from 'react';
import Toggle from '@/components/Toggle';

export default function NotificationsSettingsPage() {
  const [dailySummary, setDailySummary] = useState(true);
  const [urgentAlerts, setUrgentAlerts] = useState(true);
  const [routineReminders, setRoutineReminders] = useState(false);

  return (
    <div className="flex flex-col gap-6 px-4 w-full">
      <p className="text-gray-500 text-sm">
        Choose which Memvella activities alert your personal device.
      </p>

      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50">
         
         <div className="flex items-center justify-between p-5">
           <div className="flex flex-col pr-4">
              <label htmlFor="daily_summary" className="font-headline font-bold text-gray-900 text-base cursor-pointer">Daily Summary</label>
              <span className="text-sm text-gray-500 mt-0.5 leading-snug">Get an evening wrap-up of Mom's day and any new insights.</span>
           </div>
           <Toggle checked={dailySummary} onChange={() => setDailySummary(!dailySummary)} />
         </div>

         <div className="flex items-center justify-between p-5">
           <div className="flex flex-col pr-4">
              <label htmlFor="urgent_alerts" className="font-headline font-bold text-gray-900 text-base cursor-pointer">Urgent Alerts</label>
              <span className="text-sm text-gray-500 mt-0.5 leading-snug">Immediate notifications if Memvella detects an emergency or confusion.</span>
           </div>
           <Toggle checked={urgentAlerts} onChange={() => setUrgentAlerts(!urgentAlerts)} />
         </div>

         <div className="flex items-center justify-between p-5">
           <div className="flex flex-col pr-4">
              <label htmlFor="routine_reminders" className="font-headline font-bold text-gray-900 text-base cursor-pointer">Routine Reminders</label>
              <span className="text-sm text-gray-500 mt-0.5 leading-snug">Ping you when Mom completes or misses a scheduled routine.</span>
           </div>
           <Toggle checked={routineReminders} onChange={() => setRoutineReminders(!routineReminders)} />
         </div>

      </section>
    </div>
  );
}
