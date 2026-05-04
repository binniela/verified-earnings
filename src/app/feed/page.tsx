import { Activity, Bookmark, Radio } from "lucide-react";
import { ClaimCard } from "@/components/claim-card";
import { CommandGrid, CommandHeader, CommandPanel, CommandShell, EmptyState, MetricTile, StatusPill } from "@/components/ui";
import { demoCurrentUserId, earningClaims, follows, mentorOffers, savedItems } from "@/lib/seed-data";
import { getPersonalizedFeed, getMapSegments } from "@/lib/analytics";

export default function FeedPage() {
  const userFollows = follows.filter((follow) => follow.userId === demoCurrentUserId);
  const followedValues = userFollows.map((follow) => follow.targetValue);
  const claims = getPersonalizedFeed(earningClaims, followedValues, mentorOffers);
  const segments = getMapSegments(earningClaims, mentorOffers);
  const savedCount = savedItems.filter((item) => item.userId === demoCurrentUserId).length;

  return (
    <CommandShell>
      <CommandHeader eyebrow="Verified intelligence stream" title="Fresh proof, routed by watched signals.">
        Personalized by followed claim types, cities, and categories. No likes, no comments, no noise; just verified
        dossiers, rank-ready markets, and mentor signals.
      </CommandHeader>
      <CommandGrid
        left={
          <>
            <CommandPanel eyebrow="Watched signals" title="Follow stack">
              <div className="space-y-2">
                {userFollows.map((follow) => (
                  <div key={follow.id} className="flex items-center justify-between border border-ops-border bg-ops-surface p-3">
                    <span className="text-[11px] text-ops-text">{follow.targetValue}</span>
                    <StatusPill tone="info">{follow.targetType}</StatusPill>
                  </div>
                ))}
              </div>
            </CommandPanel>
            <CommandPanel eyebrow="Saved intel" title="Briefing cache">
              <MetricTile label="Saved briefings" value={`${savedCount}`} tone="warning" />
            </CommandPanel>
          </>
        }
        center={
          <CommandPanel eyebrow="Claim stream" title="Verified feed">
            <div className="space-y-4">
              {claims.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
              {claims.length === 0 ? (
                <EmptyState title="No signal" body="Follow cities, categories, or claim types from the map to tune this stream." />
              ) : null}
            </div>
          </CommandPanel>
        }
        right={
          <>
            <CommandPanel eyebrow="Network state" title="Stream metrics">
              <div className="grid gap-3">
                <MetricTile label="Claims routed" value={`${claims.length}`} tone="success" />
                <MetricTile label="Rank-ready markets" value={`${segments.filter((segment) => segment.percentileAvailable).length}`} tone="info" />
                <MetricTile label="Mentor signal" value={`${segments.reduce((sum, segment) => sum + segment.mentorCount, 0)}`} tone="success" />
              </div>
            </CommandPanel>
            <CommandPanel eyebrow="Operating posture" title="Reputation graph">
              <div className="space-y-3 text-[11px] leading-5 text-ops-muted">
                <div className="flex gap-3 border border-ops-border bg-ops-surface p-3">
                  <Radio className="mt-0.5 size-4 text-ops-info" />
                  Following means tracking an intelligence signal, not endorsing a post.
                </div>
                <div className="flex gap-3 border border-ops-border bg-ops-surface p-3">
                  <Bookmark className="mt-0.5 size-4 text-ops-warning" />
                  Saving creates a private briefing cache for profiles, claims, and mentor offers.
                </div>
                <div className="flex gap-3 border border-ops-border bg-ops-surface p-3">
                  <Activity className="mt-0.5 size-4 text-ops-success" />
                  High-density segments unlock rank cards; sparse segments show verified examples only.
                </div>
              </div>
            </CommandPanel>
          </>
        }
      />
    </CommandShell>
  );
}
