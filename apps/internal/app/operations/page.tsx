import Link from "next/link";
import { getOperationsOverview } from "@/lib/hq-convex";
import {
  boundedCountLabel,
  formatBoundedCount,
  formatDateTime,
  mixToRows,
} from "@/lib/format";
import {
  DataTable,
  EmptyState,
  MetricCard,
  SectionHeader,
  StatusPill,
} from "@/components/hq-primitives";

export default async function OperationsPage() {
  const operations = await getOperationsOverview();

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="warn">no production actions</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Operations</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Notification delivery, push subscription, pairing, and senior session
          diagnostics metadata. Secrets, hashes, push auth values, and endpoints are hidden.
        </p>
      </section>

      {!operations.ok ? (
        <EmptyState title="Operations read model unavailable">{operations.message}</EmptyState>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              detail={boundedCountLabel(operations.data.notificationDeliveryStatusMix.failed)}
              label="Failed deliveries"
              tone={operations.data.notificationDeliveryStatusMix.failed.value > 0 ? "bad" : "good"}
              value={formatBoundedCount(operations.data.notificationDeliveryStatusMix.failed)}
            />
            <MetricCard
              detail={boundedCountLabel(operations.data.notificationDeliveryStatusMix.queued)}
              label="Queued deliveries"
              tone="warn"
              value={formatBoundedCount(operations.data.notificationDeliveryStatusMix.queued)}
            />
            <MetricCard
              detail={boundedCountLabel(operations.data.activePushSubscriptionCount)}
              label="Active push subscriptions"
              tone="info"
              value={formatBoundedCount(operations.data.activePushSubscriptionCount)}
            />
            <MetricCard
              detail={boundedCountLabel(operations.data.seniorSessionCount)}
              label="Senior sessions"
              tone="neutral"
              value={formatBoundedCount(operations.data.seniorSessionCount)}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div>
              <SectionHeader title="Push Permission Mix" />
              <DataTable columns={["Permission", "Count"]} rows={mixToRows(operations.data.pushPermissionMix)} />
            </div>
            <div>
              <SectionHeader title="Session Status Mix" />
              <DataTable
                columns={["Status", "Count"]}
                rows={Object.entries(operations.data.seniorSessionStatusMix)}
              />
            </div>
          </section>

          <section>
            <SectionHeader title="Recent Notification Failures">
              <Link className="font-bold text-family-primary" href="/runbooks/notification-failures">
                Runbook
              </Link>
            </SectionHeader>
            <DataTable
              columns={["Circle", "Type", "Scheduled", "Updated", "Error"]}
              rows={operations.data.recentNotificationFailures.map((failure) => [
                failure.circleLabel,
                failure.notificationType,
                formatDateTime(failure.scheduledFor),
                formatDateTime(failure.updatedAt),
                failure.errorCode ?? "none",
              ])}
            />
          </section>
        </>
      )}
    </div>
  );
}
