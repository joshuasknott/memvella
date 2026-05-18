"use client";

import { useActionState } from "react";
import { Button, Input } from "@memvella/ui";
import { loginHq, type HqLoginState } from "@/app/actions";

const initialState: HqLoginState = { error: null };

export function HqLoginForm() {
  const [state, action, pending] = useActionState(loginHq, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-text-secondary" htmlFor="accessKey">
          Founder access key
        </label>
        <Input
          id="accessKey"
          name="accessKey"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Enter HQ access key"
        />
      </div>
      {state.error ? (
        <p className="rounded-md border border-status-alert/30 bg-status-alert/10 px-3 py-2 text-sm text-status-alert">
          {state.error}
        </p>
      ) : null}
      <Button className="w-full rounded-md" disabled={pending} type="submit">
        {pending ? "Checking access" : "Enter Memvella HQ"}
      </Button>
    </form>
  );
}
