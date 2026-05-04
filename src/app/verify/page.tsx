import { FileLock2, ShieldCheck, Trash2 } from "lucide-react";
import { ActionLink, CommandGrid, CommandHeader, CommandPanel, CommandShell, MetricTile, StatusPill } from "@/components/ui";
import { ReferralGateCard } from "@/components/referral-gate-card";
import { getCurrentUserBundle } from "@/lib/data";
import { acceptedProofByClaimType } from "@/lib/claim-rules";
import { verificationDocs } from "@/lib/seed-data";
import { formatCurrency } from "@/lib/format";

export default function VerifyPage() {
  const { claims } = getCurrentUserBundle();
  const docs = verificationDocs.filter((doc) => claims.some((claim) => claim.id === doc.claimId));

  return (
    <CommandShell>
      <CommandHeader eyebrow="Verification operations" title="Private proof intake and review status.">
        Raw documents stay private. The public badge stores extracted facts, reviewer notes, and a file hash.
      </CommandHeader>
      <CommandGrid
        left={
          <CommandPanel eyebrow="Accepted proof" title="Document classes">
            <div className="space-y-3">
              {Object.entries(acceptedProofByClaimType).map(([type, docs]) => (
                <div key={type} className="border border-ops-border bg-ops-surface p-3">
                  <StatusPill tone={type === "trading" ? "trading" : type === "business" ? "success" : "info"}>{type}</StatusPill>
                  <p className="mt-2 text-[11px] leading-5 text-ops-muted">{docs.map((doc) => doc.replaceAll("_", " ")).join(", ")}</p>
                </div>
              ))}
            </div>
          </CommandPanel>
        }
        center={
          <CommandPanel eyebrow="Claim status" title="Verification queue">
            <div className="space-y-3">
              {claims.map((claim) => (
                <div key={claim.id} className="border border-ops-border bg-ops-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-black uppercase tracking-[0.14em] text-ops-text">{claim.role}</p>
                      <p className="mt-1 text-[11px] text-ops-muted">
                        {claim.city}, {claim.state} / {claim.amountBasis.replaceAll("_", " ")}
                      </p>
                    </div>
                    <p className="font-black text-ops-info">{formatCurrency(claim.amountCents)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill tone={claim.verificationStatus === "approved" ? "success" : "warning"}>{claim.verificationStatus}</StatusPill>
                    <StatusPill tone={claim.visibilityStatus === "public" ? "info" : "neutral"}>{claim.visibilityStatus}</StatusPill>
                  </div>
                </div>
              ))}
              {claims.filter((c) => c.visibilityStatus === "gated").map((claim) => (
                <ReferralGateCard key={claim.id} claim={claim} />
              ))}
              {docs.length === 0 ? <p className="text-sm text-ops-muted">No uploaded documents for the demo user yet.</p> : null}
            </div>
            <div className="mt-5">
              <ActionLink href="/claim/new" tone="success">Start proof intake</ActionLink>
            </div>
          </CommandPanel>
        }
        right={
          <>
            <CommandPanel eyebrow="Privacy posture" title="Storage controls">
              <div className="grid gap-3">
                <MetricTile label="Signed URL" value="60s" tone="info" />
                <MetricTile label="Raw retention" value="30 days" tone="warning" />
                <MetricTile label="Public docs" value="Never" tone="success" />
              </div>
            </CommandPanel>
            <CommandPanel eyebrow="Review logic" title="Automation boundary">
              <div className="space-y-3 text-[11px] leading-5 text-ops-muted">
                <div className="flex gap-3 border border-ops-border bg-ops-surface p-3">
                  <FileLock2 className="mt-0.5 size-4 text-ops-info" />
                  Supabase Storage is private; admins use short-lived signed URLs only.
                </div>
                <div className="flex gap-3 border border-ops-border bg-ops-surface p-3">
                  <ShieldCheck className="mt-0.5 size-4 text-ops-success" />
                  Only low-risk career PDFs can auto-approve after a 10% amount match.
                </div>
                <div className="flex gap-3 border border-ops-border bg-ops-surface p-3">
                  <Trash2 className="mt-0.5 size-4 text-ops-warning" />
                  Raw files are deleted after final review while audit facts remain.
                </div>
              </div>
            </CommandPanel>
          </>
        }
      />
    </CommandShell>
  );
}
