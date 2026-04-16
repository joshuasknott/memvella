import { describe, expect, it } from "vitest";
import type { Id } from "./_generated/dataModel";
import {
  buildNotificationDeliveryResultPatches,
  resolveNotificationEnqueueDecision,
} from "./notifications";

describe("resolveNotificationEnqueueDecision", () => {
  it("reuses an existing delivery for dedupe", () => {
    const deliveryId = "delivery-1" as Id<"notificationDeliveries">;

    expect(resolveNotificationEnqueueDecision(deliveryId)).toEqual({
      deliveryId,
      created: false,
    });
  });

  it("creates a new delivery when no duplicate exists", () => {
    expect(resolveNotificationEnqueueDecision(null)).toBeNull();
  });
});

describe("buildNotificationDeliveryResultPatches", () => {
  it("resets subscription failures after a sent delivery", () => {
    const result = buildNotificationDeliveryResultPatches({
      status: "sent",
      now: 100,
      currentFailureCount: 3,
    });

    expect(result).toEqual({
      deliveryPatch: {
        status: "sent",
        updatedAt: 100,
        dispatchedAt: 100,
        lastError: null,
      },
      subscriptionPatch: {
        lastDeliveryAt: 100,
        lastFailureAt: null,
        failureCount: 0,
        updatedAt: 100,
      },
    });
  });

  it("keeps skipped deliveries non-destructive", () => {
    const result = buildNotificationDeliveryResultPatches({
      status: "skipped",
      now: 200,
      currentFailureCount: 2,
      errorMessage: "Push disabled",
    });

    expect(result).toEqual({
      deliveryPatch: {
        status: "skipped",
        updatedAt: 200,
        dispatchedAt: 200,
        lastError: "Push disabled",
      },
      subscriptionPatch: {
        updatedAt: 200,
      },
    });
  });

  it("increments failures without revoking below the threshold", () => {
    const result = buildNotificationDeliveryResultPatches({
      status: "failed",
      now: 300,
      currentFailureCount: 3,
      errorMessage: "Timeout",
    });

    expect(result).toEqual({
      deliveryPatch: {
        status: "failed",
        updatedAt: 300,
        dispatchedAt: 300,
        lastError: "Timeout",
      },
      subscriptionPatch: {
        lastFailureAt: 300,
        failureCount: 4,
        updatedAt: 300,
      },
    });
  });

  it("revokes a subscription after repeated delivery failures", () => {
    const result = buildNotificationDeliveryResultPatches({
      status: "failed",
      now: 400,
      currentFailureCount: 4,
      errorMessage: "410 Gone",
    });

    expect(result).toEqual({
      deliveryPatch: {
        status: "failed",
        updatedAt: 400,
        dispatchedAt: 400,
        lastError: "410 Gone",
      },
      subscriptionPatch: {
        lastFailureAt: 400,
        failureCount: 5,
        updatedAt: 400,
        revokedAt: 400,
        revokedReason: "push_delivery_failed_repeatedly",
      },
    });
  });
});
