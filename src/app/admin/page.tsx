import { FileSearch, ShieldAlert } from "lucide-react";
import { ActionChip, CommandGrid, CommandHeader, CommandPanel, CommandShell, MetadataRow, MetricTile, StatusPill } from "@/components/ui";
import { getAdminQueue } from "@/lib/data";
import { formatBasis, formatCurrency } from "@/lib/format";

export default function AdminPage() {
  const queue = getAdminQueue();
  const selected = queue[0];

  return (
    <CommandShell>
      <CommandHeader eyebrow="Internal review console" title="Verification and mentor moderation queue.">
        Business, freelance, and trading claims route here by default. Reviewers compare claimed amount, parser output,
        proof type, risk flags, and reviewer notes before publishing.
      </CommandHeader>
      <CommandGrid
        left={
          <>
            <CommandPanel eyebrow="Queue filters" title="Review state">
              <div className="grid gap-3">
                <MetricTile label="Pending docs" value={`${queue.length}`} tone="warning" />
                <MetricTile label="Signed URL policy" value="60s" tone="info" />
                <MetricTile label="Raw doc retention" value="30 days" tone="success" />
              </div>
            </CommandPanel>
            <CommandPanel eyebrow="Risk states" title="Flags">
              <div className="space-y-2">
                {["Manual review required", "Outlier flagged", "Parser mismatch", "Trading guardrail"].map((flag) => (
                  <StatusPill key={flag} tone={flag.includes("Outlier") || flag.includes("mismatch") ? "danger" : "warning"}>
                    {flag}
                  </StatusPill>
                ))}
              </div>
            </CommandPanel>
          </>
        }
        center={
          <CommandPanel eyebrow="Document review" title="Pending queue">
            <div className="space-y-4">
              {queue.map(({ doc, claim, user }) => (
                <div key={doc.id} className="border border-ops-border bg-ops-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ops-border pb-4">
                    <div>
                      <div className="flex items-center gap-2 text-ops-warning">
                        <ShieldAlert className="size-5" />
                        <p className="text-[10px] font-black uppercase tracking-[0.16em]">Manual review required</p>
                      </div>
                      <h2 className="mt-3 text-[13px] font-black uppercase tracking-[0.14em] text-ops-text">{claim?.role}</h2>
                      <p className="mt-1 text-[11px] text-ops-muted">
                        {user?.name} / {claim?.city}, {claim?.state} / {claim ? formatBasis(claim.amountBasis) : "unknown basis"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-ops-text">{formatCurrency(doc.claimedAmountCents)}</p>
                      <p className="text-[11px] text-ops-muted">
                        Parsed {doc.parsedAmountCents ? formatCurrency(doc.parsedAmountCents) : "not available"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <MetricTile label="Proof" value={doc.docType.replaceAll("_", " ")} tone="info" />
                    <MetricTile label="Parser" value={doc.parserStatus} tone={doc.parserStatus === "manual_required" ? "warning" : "success"} />
                    <MetricTile label="Risk" value={doc.outlierFlagged ? "Outlier" : "Clear"} tone={doc.outlierFlagged ? "danger" : "success"} />
                  </div>
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ops-muted">
                    {doc.parserNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <ActionChip tone="success">Approve</ActionChip>
                    <ActionChip tone="danger">Reject</ActionChip>
                    <ActionChip tone="info">
                      <FileSearch className="size-4" />
                      Open signed URL
                    </ActionChip>
                  </div>
                </div>
              ))}
            </div>
          </CommandPanel>
        }
        right={
          <CommandPanel eyebrow="Selected claim" title="Risk briefing">
            {selected ? (
              <div className="grid gap-1">
                <MetadataRow label="Claim" value={selected.claim?.role} />
                <MetadataRow label="Reviewer view" value="Parser output plus private document URL" />
                <MetadataRow label="Match" value={selected.doc.incomeMatch ? "Within tolerance" : "Needs investigation"} />
                <MetadataRow label="Outlier" value={selected.doc.outlierFlagged ? "Flagged" : "Clear"} />
                <MetadataRow label="Decision" value="Approve or reject with reason" />
              </div>
            ) : (
              <p className="text-sm text-ops-muted">No pending document selected.</p>
            )}
          </CommandPanel>
        }
      />
    </CommandShell>
  );
}
