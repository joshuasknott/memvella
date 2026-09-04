"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Loader2, LogOut } from "lucide-react";
import { api } from "@memvella/backend";
import { authClient } from "@/lib/auth-client";
import { useCircleProfile } from "@/lib/use-circle-profile";
import { useToast } from "@/components/ui/ToastProvider";

export default function AccountSettingsPage() {
  const { data: session } = authClient.useSession();
  const { organiserName, seniorDisplayName, profile, isOrganiser } =
    useCircleProfile();
  const { toast } = useToast();
  const patchProfile = useMutation(api.profile.patchOrganiserProfile);
  const [name, setName] = useState<string | null>(null);
  const [seniorName, setSeniorName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await patchProfile({
        organiserName: (name ?? organiserName).trim(),
        seniorDisplayName: (seniorName ?? seniorDisplayName).trim(),
      });
      toast({
        tone: "success",
        title: "Details saved",
        description: "Your changes are ready.",
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Your details couldn’t save. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function signOut() {
    setSigningOut(true);
    setError(null);
    try {
      const result = await authClient.signOut();
      if (result.error)
        throw new Error(result.error.message ?? "Please try again.");
      localStorage.removeItem("memvella_pendingSeniorDisplayName");
      window.location.replace("/organiser/signin");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Sign out failed. Try again.",
      );
      setSigningOut(false);
    }
  }
  return (
    <div className="memory-editor">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Your details</p>
          <h1>Account</h1>
          <p>{session?.user?.email}</p>
        </div>
      </section>
      {!profile ? (
        <p role="status">Loading account…</p>
      ) : isOrganiser ? (
        <form onSubmit={save}>
          <div>
            <label htmlFor="account-name">Your name</label>
            <input
              id="account-name"
              autoComplete="name"
              value={name ?? organiserName}
              onChange={(event) => setName(event.target.value)}
              required
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor="account-senior-name">Who are you supporting?</label>
            <input
              id="account-senior-name"
              value={seniorName ?? seniorDisplayName}
              onChange={(event) => setSeniorName(event.target.value)}
              required
              disabled={saving}
            />
          </div>
          <div>
            <button type="submit" className="action-button" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="panel">
          <h2 className="text-xl font-semibold">{organiserName}</h2>
          <p className="mt-2 text-text-secondary">
            Supporter for {seniorDisplayName}
          </p>
        </div>
      )}
      {error ? (
        <p role="alert" className="form-error">
          {error}
        </p>
      ) : null}
      <div className="editor-footer">
        <p className="text-text-secondary">Sign out on this device.</p>
        <button
          type="button"
          className="quiet-link"
          data-testid="family-account-signout-button"
          disabled={signingOut}
          onClick={() => void signOut()}
        >
          <LogOut size={20} aria-hidden="true" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
