export type ClaimType = "career" | "business" | "freelance" | "trading";

export type AmountBasis =
  | "annual_salary"
  | "total_comp"
  | "offer"
  | "w2_income"
  | "gross_1099_income"
  | "net_self_employment_income"
  | "business_net_profit"
  | "owner_income"
  | "realized_trading_pnl";

export type VerificationStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "flagged";

export type VisibilityStatus = "private" | "pending_review" | "gated" | "public" | "suspended";

export type VerificationTier = 0 | 1 | 2;

export type DocumentType =
  | "pay_stub"
  | "w2"
  | "1099"
  | "offer_letter"
  | "employment_contract"
  | "tax_excerpt"
  | "platform_payout"
  | "invoice_bank_match"
  | "schedule_c"
  | "k1"
  | "business_tax_return"
  | "cpa_letter_pnl"
  | "accounting_export"
  | "brokerage_tax_form"
  | "brokerage_statement"
  | "broker_export";

export type User = {
  id: string;
  linkedinId?: string;
  name: string;
  anonymousName: string;
  avatarUrl?: string;
  headline?: string;
  isAdmin?: boolean;
  createdAt: string;
};

export type EarningClaim = {
  id: string;
  userId: string;
  claimType: ClaimType;
  amountBasis: AmountBasis;
  amountCents: number;
  periodStart: string;
  periodEnd: string;
  role: string;
  category: string;
  city: string;
  state: string;
  country: string;
  verificationStatus: VerificationStatus;
  verificationTier: VerificationTier;
  visibilityStatus: VisibilityStatus;
  displayAnonymously: boolean;
  shareSlug: string;
  documentType?: DocumentType;
  verifiedAt?: string;
  createdAt: string;
  summary: string;
  proofNote: string;
  mentorReady: boolean;
  riskFlags: string[];
};

export type VerificationDoc = {
  id: string;
  claimId: string;
  docType: DocumentType;
  storagePath: string;
  claimedAmountCents: number;
  parsedAmountCents?: number;
  incomeMatch?: boolean;
  outlierFlagged: boolean;
  parserStatus: "pending" | "parsed" | "manual_required" | "failed";
  parserNotes: string[];
  reviewStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
};

export type MentorOffer = {
  id: string;
  userId: string;
  claimId: string;
  title: string;
  topics: string[];
  rateCents: number;
  durationMinutes: number;
  calendlyUrl?: string;
  stripeConnectedAccountId?: string;
  status: "draft" | "active" | "suspended";
  createdAt: string;
};

export type Follow = {
  id: string;
  userId: string;
  targetType: "profile" | "city" | "category" | "claim_type";
  targetValue: string;
  createdAt: string;
};

export type SavedItem = {
  id: string;
  userId: string;
  itemType: "profile" | "claim" | "map_segment" | "mentor_offer";
  itemId: string;
  createdAt: string;
};

export type City = {
  name: string;
  state: string;
  country: string;
};

export type Role = {
  title: string;
  category: string;
  claimType: ClaimType;
};

export type Referral = {
  id: string;
  code: string;
  claimId: string;
  creatorUserId: string;
  unlockThreshold: number;
  activationCount: number;
  unlockedAt?: string;
  createdAt: string;
};

export type ReferralActivation = {
  id: string;
  referralId: string;
  activatedUserId: string;
  createdAt: string;
};

export type MapSegment = {
  key: string;
  claimType: ClaimType;
  category: string;
  city: string;
  state: string;
  count: number;
  medianCents: number;
  topCents: number;
  mentorCount: number;
  percentileAvailable: boolean;
};
