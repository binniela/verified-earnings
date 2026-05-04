"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FileUp, ShieldAlert } from "lucide-react";
import { amountBasisByClaimType, acceptedProofByClaimType } from "@/lib/claim-rules";
import type { ClaimType } from "@/lib/types";
import { formatBasis, formatClaimType } from "@/lib/format";
import { Button, Card } from "@/components/ui";

const claimTypes: ClaimType[] = ["career", "business", "freelance", "trading"];

export function ClaimWizard() {
  const [claimType, setClaimType] = useState<ClaimType>("career");
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const basisOptions = useMemo(() => amountBasisByClaimType[claimType], [claimType]);
  const proofOptions = useMemo(() => acceptedProofByClaimType[claimType], [claimType]);

  async function handleSubmit(formData: FormData) {
    setStatus("submitting");

    const amount = Number(formData.get("amount"));
    const payload = {
      claimType,
      amountBasis: formData.get("amountBasis"),
      amountCents: Math.round(amount * 100),
      periodStart: formData.get("periodStart"),
      periodEnd: formData.get("periodEnd"),
      role: formData.get("role"),
      category: formData.get("category"),
      city: formData.get("city"),
      state: formData.get("state"),
      country: "US",
      displayAnonymously: formData.get("displayAnonymously") === "on",
      summary: formData.get("summary"),
      documentType: formData.get("documentType"),
    };

    await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setStatus("submitted");
  }

  return (
    <Card className="p-6">
      {status === "submitted" ? (
        <div className="border border-ops-success/35 bg-ops-success/10 p-6 text-ops-success">
          <CheckCircle2 className="size-8" />
          <h2 className="mt-4 text-[13px] font-black uppercase tracking-[0.14em]">Claim drafted</h2>
          <p className="mt-2 text-sm leading-6 text-ops-text">
            In production this draft routes into Supabase and continues to the private proof upload step. Demo mode keeps the
            public map clean until review approves it.
          </p>
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.18em] text-ops-muted">Earning type</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-4">
              {claimTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setClaimType(type)}
                  className={`border px-3 py-3 text-left text-[10px] font-black uppercase tracking-[0.14em] ${
                    claimType === type ? "border-ops-info/50 bg-ops-info/15 text-ops-info" : "border-ops-border bg-ops-surface text-ops-muted hover:border-ops-info/40 hover:text-ops-text"
                  }`}
                >
                  {formatClaimType(type)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-muted">Amount basis</span>
              <select name="amountBasis" className="h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text">
                {basisOptions.map((basis) => (
                  <option key={basis} value={basis}>
                    {formatBasis(basis)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-muted">Verified amount</span>
              <input
                required
                name="amount"
                type="number"
                min="1"
                placeholder="180000"
                className="h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text placeholder:text-ops-muted"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-muted">Role or earning identity</span>
              <input required name="role" placeholder="Agency owner, Staff Engineer..." className="h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text placeholder:text-ops-muted" />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-muted">Category</span>
              <input required name="category" placeholder="Agency, Engineering, Options..." className="h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text placeholder:text-ops-muted" />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-muted">City</span>
              <input required name="city" placeholder="Austin" className="h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text placeholder:text-ops-muted" />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-muted">State</span>
              <input required name="state" placeholder="TX" className="h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text placeholder:text-ops-muted" />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-muted">Period start</span>
              <input required name="periodStart" type="date" defaultValue="2025-01-01" className="h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text" />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-muted">Period end</span>
              <input required name="periodEnd" type="date" defaultValue="2025-12-31" className="h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text" />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-muted">Proof type</span>
            <select name="documentType" className="h-11 w-full border border-ops-border bg-ops-surface px-3 text-ops-text">
              {proofOptions.map((proof) => (
                <option key={proof} value={proof}>
                  {proof.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-muted">Claim summary</span>
            <textarea
              required
              name="summary"
              rows={4}
              placeholder="What should people understand about the verified result?"
              className="w-full border border-ops-border bg-ops-surface px-3 py-2 text-ops-text placeholder:text-ops-muted"
            />
          </label>

          <div className="flex items-start gap-3 border border-ops-border bg-ops-surface p-4">
            <input name="displayAnonymously" type="checkbox" defaultChecked className="mt-1 size-4" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ops-text">Anonymous display default</p>
              <p className="mt-1 text-sm text-ops-muted">You can reveal your name later for mentorship credibility.</p>
            </div>
          </div>

          <div className="border border-ops-warning/35 bg-ops-warning/10 p-4 text-sm leading-6 text-ops-warning">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em]">
              <ShieldAlert className="size-4" />
              Strict verification
            </div>
            <p className="mt-1 text-ops-text">
              Business, freelance, and trading claims always require manual review. Screenshots, revenue-only claims,
              unrealized gains, and leaderboard images do not receive an income badge.
            </p>
          </div>

          <Button disabled={status === "submitting"} type="submit">
            <FileUp className="size-4" />
            {status === "submitting" ? "Saving draft..." : "Create claim draft"}
          </Button>
        </form>
      )}
    </Card>
  );
}
