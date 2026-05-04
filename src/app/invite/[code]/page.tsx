"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Radar, UserPlus } from "lucide-react";
import { CommandShell, StatusPill } from "@/components/ui";
import { REFERRAL_UNLOCK_THRESHOLD } from "@/lib/referral-config";

type InviteState =
  | { phase: "loading" }
  | { phase: "ready"; category: string; city: string; state: string; claimType: string; creatorHandle: string }
  | { phase: "activating" }
  | { phase: "activated"; unlocked: boolean; activationCount: number; shareSlug?: string }
  | { phase: "error"; message: string };

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [state, setState] = useState<InviteState>({ phase: "loading" });

  useEffect(() => {
    // In demo mode without Supabase, show a static preview
    setState({
      phase: "ready",
      category: "Software Engineering",
      city: "New York",
      state: "NY",
      claimType: "career",
      creatorHandle: "an anonymous earner",
    });
  }, [code]);

  async function handleJoin() {
    setState({ phase: "activating" });

    try {
      const res = await fetch("/api/referrals/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (res.status === 401) {
        // Not signed in — redirect to auth, then come back
        router.push(`/login?next=/invite/${code}`);
        return;
      }

      const json = await res.json();

      if (!res.ok) {
        setState({ phase: "error", message: json.error ?? "Something went wrong." });
        return;
      }

      setState({
        phase: "activated",
        unlocked: json.data.unlocked,
        activationCount: json.data.activationCount,
        shareSlug: json.data.shareSlug,
      });

      if (json.data.unlocked && json.data.shareSlug) {
        setTimeout(() => router.push(`/share/claim/${json.data.shareSlug}`), 1800);
      }
    } catch {
      setState({ phase: "error", message: "Network error. Please try again." });
    }
  }

  return (
    <CommandShell className="flex items-center">
      <div className="mx-auto w-full max-w-2xl">
        <div className="border border-ops-border bg-ops-panel p-8">
          <div className="flex items-center gap-2">
            <Radar className="size-4 text-ops-info" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-ops-info">
              Verified Earnings — Invite
            </span>
          </div>

          {state.phase === "loading" && (
            <p className="mt-8 text-ops-muted">Loading…</p>
          )}

          {state.phase === "ready" && (
            <>
              <h1 className="mt-6 text-3xl font-black uppercase tracking-[0.06em] text-ops-text">
                A verified income claim<br />is waiting for you
              </h1>
              <p className="mt-4 text-ops-muted leading-7">
                {state.creatorHandle} shared a verified{" "}
                <span className="text-ops-text font-semibold">{state.category}</span> claim from{" "}
                <span className="text-ops-text font-semibold">{state.city}, {state.state}</span>.
                Join to see the verified amount and add your own earnings.
              </p>

              <div className="mt-6 border border-ops-border bg-ops-surface p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ops-muted uppercase tracking-wider text-[10px]">Category</span>
                  <span className="text-ops-text font-semibold">{state.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ops-muted uppercase tracking-wider text-[10px]">Market</span>
                  <span className="text-ops-text font-semibold">{state.city}, {state.state}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ops-muted uppercase tracking-wider text-[10px]">Claim type</span>
                  <span className="text-ops-text font-semibold capitalize">{state.claimType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ops-muted uppercase tracking-wider text-[10px]">Amount</span>
                  <span className="text-ops-muted italic">Verified — join to see</span>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={handleJoin}
                  className="flex items-center justify-center gap-2 bg-ops-info px-6 py-3 text-sm font-black uppercase tracking-widest text-ops-bg hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="size-4" />
                  Join to see verified claim
                </button>
                <p className="text-center text-[11px] text-ops-muted">
                  Free to join. Document-verified claims only. No screenshots or unverified screenshots.
                </p>
              </div>
            </>
          )}

          {state.phase === "activating" && (
            <p className="mt-8 text-ops-muted animate-pulse">Activating referral…</p>
          )}

          {state.phase === "activated" && (
            <>
              <h1 className="mt-6 text-3xl font-black uppercase tracking-[0.06em] text-ops-text">
                {state.unlocked ? "Claim is now live." : "You're in."}
              </h1>
              {state.unlocked ? (
                <p className="mt-4 text-ops-success leading-7">
                  The referral threshold was met. The verified claim is now public. Redirecting…
                </p>
              ) : (
                <>
                  <p className="mt-4 text-ops-muted leading-7">
                    {state.activationCount} of {REFERRAL_UNLOCK_THRESHOLD} friends have joined.
                    The claim will go public once the threshold is met.
                  </p>
                  <div className="mt-6">
                    <div className="h-2 w-full bg-ops-surface border border-ops-border">
                      <div
                        className="h-full bg-ops-info transition-all"
                        style={{ width: `${Math.min(100, (state.activationCount / REFERRAL_UNLOCK_THRESHOLD) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-ops-muted">
                      {state.activationCount}/{REFERRAL_UNLOCK_THRESHOLD} — {REFERRAL_UNLOCK_THRESHOLD - state.activationCount} more needed
                    </p>
                  </div>
                  <div className="mt-6">
                    <StatusPill tone="success">Referral activated</StatusPill>
                  </div>
                </>
              )}
            </>
          )}

          {state.phase === "error" && (
            <>
              <h1 className="mt-6 text-2xl font-black uppercase tracking-[0.06em] text-ops-danger">
                Activation failed
              </h1>
              <p className="mt-4 text-ops-muted">{state.message}</p>
              <button
                onClick={() => setState({ phase: "loading" })}
                className="mt-6 text-sm text-ops-info underline underline-offset-4"
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    </CommandShell>
  );
}
