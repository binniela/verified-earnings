import {
  demoCurrentUserId,
  earningClaims,
  follows,
  mentorOffers,
  savedItems,
  users,
  verificationDocs,
} from "@/lib/seed-data";

export function getUser(userId: string) {
  return users.find((user) => user.id === userId);
}

export function getClaim(claimId: string) {
  return earningClaims.find((claim) => claim.id === claimId);
}

export function getClaimBySlug(slug: string) {
  return earningClaims.find((claim) => claim.shareSlug === slug);
}

export function getClaimsForUser(userId: string) {
  return earningClaims.filter((claim) => claim.userId === userId);
}

export function getMentorOfferForClaim(claimId: string) {
  return mentorOffers.find((offer) => offer.claimId === claimId && offer.status === "active");
}

export function getMentorOffersForUser(userId: string) {
  return mentorOffers.filter((offer) => offer.userId === userId);
}

export function getProfileBundle(userId: string) {
  const user = getUser(userId);
  const claims = getClaimsForUser(userId).filter(
    (claim) => claim.visibilityStatus === "public" && claim.verificationStatus === "approved",
  );
  const offers = getMentorOffersForUser(userId).filter((offer) => offer.status === "active");

  return { user, claims, offers };
}

export function getAdminQueue() {
  return verificationDocs
    .filter((doc) => doc.reviewStatus === "pending")
    .map((doc) => ({
      doc,
      claim: getClaim(doc.claimId),
      user: getClaim(doc.claimId) ? getUser(getClaim(doc.claimId)!.userId) : undefined,
    }));
}

export function getCurrentUserBundle() {
  const user = getUser(demoCurrentUserId)!;
  const claims = getClaimsForUser(demoCurrentUserId);
  const userFollows = follows.filter((follow) => follow.userId === demoCurrentUserId);
  const userSavedItems = savedItems.filter((item) => item.userId === demoCurrentUserId);

  return { user, claims, follows: userFollows, savedItems: userSavedItems };
}
