"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { StatusPill } from "@/components/ui";
import { REFERRAL_UNLOCK_THRESHOLD } from "@/lib/referral-config";
import { formatCurrency } from "@/lib/format";
import type { EarningClaim } from "@/lib/types";

type ReferralStatus = {
  activationCount: number;
  unlockThreshold: number;
  unlocked: boolean;
  inviteUrl: string;
};

function useCopyToClipboard(text: string) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return { copied, copy };
}

export function ReferralGateCard({ claim }: { claim: EarningClaim }) {
  const [status, setStatus] = useState<ReferralStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/referrals?claimId=${claim.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setStatus(json.data);
      })
      .finally(() => setLoading(false));
  }, [claim.id]);

  const inviteUrl = status?.inviteUrl ?? `${window.location.origin}/invite/DEMO1234`;
  const { copied, copy } = useCopyToClipboard(inviteUrl);

  const activationCount = status?.activationCount ?? 0;
  const needed = REFERRAL_UNLOCK_THRESHOLD - activationCount;
  const progressPct = Math.min(100, (activationCount / REFERRAL_UNLOCK_THRESHOLD) * 100);

  if (loading) return null;
  if (claim.visibilityStatus === "public") return null;
  if (claim.visibilityStatus !== "gated") return null;

  return (
    <div className="border border-ops-border bg-ops-panel p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ops-info">
            Your badge is verified — take it live
          </p>
          <h2 className="mt-2 text-xl font-black uppercase tracking-[0.05em] text-ops-text">
            {formatCurrency(claim.amountCents)} {claim.amountBasis.replaceAll("_", " ")}
          </h2>
        </div>
        <StatusPill tone="warning">Gated</StatusPill>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-ops-muted uppercase tracking-wider">Referral progress</span>
          <span className="text-[11px] text-ops-text font-semibold">{activationCount} / {REFERRAL_UNLOCK_THRESHOLD}</span>
        </div>
        <div className="h-2 w-full bg-ops-surface border border-ops-border">
          <div
            className="h-full bg-ops-info transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-ops-muted">
          {needed > 0
            ? `Invite ${needed} more ${needed === 1 ? "person" : "people"} to publish your claim.`
            : "Threshold met — claim is going public."}
        </p>
      </div>

      <p className="mt-5 text-sm text-ops-muted leading-6">
        &ldquo;Your {formatCurrency(claim.amountCents)} badge is ready.{" "}
        {needed > 0
          ? `Invite ${needed} more ${needed === 1 ? "person" : "people"} to take it live.`
          : "It's live!"}&rdquo;
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={copy}
          className="flex items-center gap-2 border border-ops-border bg-ops-surface px-4 py-2 text-xs font-black uppercase tracking-widest text-ops-text hover:border-ops-info hover:text-ops-info transition-colors"
        >
          {copied ? <Check className="size-3.5 text-ops-success" /> : <Copy className="size-3.5" />}
          {copied ? "Copied!" : "Copy invite link"}
        </button>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 border border-ops-border bg-ops-surface px-4 py-2 text-xs font-black uppercase tracking-widest text-ops-text hover:border-ops-info hover:text-ops-info transition-colors"
        >
          <Share2 className="size-3.5" />
          Share on LinkedIn
        </a>
      </div>
    </div>
  );
}
