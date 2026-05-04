import { FileLock2, ShieldAlert } from "lucide-react";
import { ClaimWizard } from "@/components/claim-wizard";
import { CommandGrid, CommandHeader, CommandPanel, CommandShell, StatusPill } from "@/components/ui";
import { acceptedProofByClaimType } from "@/lib/claim-rules";

export default function NewClaimPage() {
  return (
    <CommandShell>
      <CommandHeader eyebrow="Proof intake" title="Prove the specific result, not a vague money story.">
        Claims start private, default to anonymous display, and become public only after verification. Broad earning
        categories are supported, but proof standards stay strict.
      </CommandHeader>
      <CommandGrid
        left={
          <CommandPanel eyebrow="Claim classes" title="Proof standards">
            <div className="space-y-3">
              {Object.entries(acceptedProofByClaimType).map(([type, docs]) => (
                <div key={type} className="border border-ops-border bg-ops-surface p-3">
                  <StatusPill tone={type === "trading" ? "trading" : type === "business" ? "success" : "info"}>{type}</StatusPill>
                  <p className="mt-2 text-[11px] leading-5 text-ops-muted">{docs.slice(0, 4).map((doc) => doc.replaceAll("_", " ")).join(", ")}</p>
                </div>
              ))}
            </div>
          </CommandPanel>
        }
        center={<ClaimWizard />}
        right={
          <>
            <CommandPanel eyebrow="Rejection triggers" title="Non-qualifying proof">
              <div className="space-y-2 text-[11px] leading-5 text-ops-muted">
                {["Screenshots", "Discord claims", "Revenue-only business claims", "Unrealized gains", "Leaderboard images"].map((item) => (
                  <div key={item} className="border border-ops-danger/35 bg-ops-danger/10 p-3 text-ops-danger">
                    {item}
                  </div>
                ))}
              </div>
            </CommandPanel>
            <CommandPanel eyebrow="Privacy" title="Document handling">
              <div className="space-y-3 text-[11px] leading-5 text-ops-muted">
                <div className="flex gap-3 border border-ops-border bg-ops-surface p-3">
                  <FileLock2 className="mt-0.5 size-4 text-ops-info" />
                  Raw documents stay private and use short-lived admin signed URLs.
                </div>
                <div className="flex gap-3 border border-ops-border bg-ops-surface p-3">
                  <ShieldAlert className="mt-0.5 size-4 text-ops-warning" />
                  Business, freelance, and trading claims route to manual review in MVP.
                </div>
              </div>
            </CommandPanel>
          </>
        }
      />
    </CommandShell>
  );
}
