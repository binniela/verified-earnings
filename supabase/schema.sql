-- Verified Earnings MVP schema
-- Run in Supabase SQL editor after enabling pgcrypto and configuring Auth.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE claim_type AS ENUM ('career', 'business', 'freelance', 'trading');
CREATE TYPE amount_basis AS ENUM (
  'annual_salary',
  'total_comp',
  'offer',
  'w2_income',
  'gross_1099_income',
  'net_self_employment_income',
  'business_net_profit',
  'owner_income',
  'realized_trading_pnl'
);
CREATE TYPE verification_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'flagged');
CREATE TYPE visibility_status AS ENUM ('private', 'pending_review', 'gated', 'public', 'suspended');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_id TEXT UNIQUE,
  name TEXT NOT NULL,
  anonymous_name TEXT NOT NULL,
  avatar_url TEXT,
  headline TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.claim_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_type claim_type NOT NULL,
  name TEXT NOT NULL,
  UNIQUE (claim_type, name)
);

CREATE TABLE public.business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  claim_type claim_type NOT NULL
);

CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  UNIQUE (name, state, country)
);

CREATE TABLE public.earning_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  claim_type claim_type NOT NULL,
  amount_basis amount_basis NOT NULL,
  amount_cents INT NOT NULL CHECK (amount_cents > 0),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  verification_status verification_status NOT NULL DEFAULT 'draft',
  verification_tier INT NOT NULL DEFAULT 0 CHECK (verification_tier BETWEEN 0 AND 2),
  visibility_status visibility_status NOT NULL DEFAULT 'private',
  display_anonymously BOOLEAN NOT NULL DEFAULT true,
  share_slug TEXT UNIQUE NOT NULL,
  document_type TEXT,
  summary TEXT NOT NULL,
  proof_note TEXT NOT NULL DEFAULT '',
  risk_flags TEXT[] NOT NULL DEFAULT '{}',
  mentor_ready BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (period_end >= period_start),
  CHECK (
    (claim_type = 'career' AND amount_basis IN ('annual_salary', 'total_comp', 'offer', 'w2_income', 'gross_1099_income'))
    OR (claim_type = 'business' AND amount_basis IN ('business_net_profit', 'owner_income'))
    OR (claim_type = 'freelance' AND amount_basis IN ('gross_1099_income', 'net_self_employment_income'))
    OR (claim_type = 'trading' AND amount_basis = 'realized_trading_pnl')
  )
);

CREATE TABLE public.verification_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.earning_claims(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_sha256 TEXT,
  claimed_amount_cents INT NOT NULL,
  parsed_amount_cents INT,
  income_match BOOLEAN,
  outlier_flagged BOOLEAN NOT NULL DEFAULT false,
  parser_status TEXT NOT NULL DEFAULT 'pending',
  parser_notes TEXT[] NOT NULL DEFAULT '{}',
  immutable_parser_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  review_status review_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  raw_document_delete_after TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.mentor_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES public.earning_claims(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  rate_cents INT NOT NULL CHECK (rate_cents > 0),
  duration_minutes INT NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  calendly_url TEXT,
  stripe_connected_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_offer_id UUID NOT NULL REFERENCES public.mentor_offers(id),
  mentor_id UUID NOT NULL REFERENCES public.users(id),
  mentee_id UUID NOT NULL REFERENCES public.users(id),
  stripe_checkout_session_id TEXT,
  stripe_payment_intent TEXT,
  stripe_connected_account_id TEXT,
  amount_cents INT NOT NULL,
  platform_fee_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  calendly_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'city', 'category', 'claim_type')),
  target_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, target_type, target_value)
);

CREATE TABLE public.saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('profile', 'claim', 'map_segment', 'mentor_offer')),
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, item_type, item_id)
);

CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  claim_id UUID NOT NULL REFERENCES public.earning_claims(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  unlock_threshold INT NOT NULL DEFAULT 2,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.referral_activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  activated_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referral_id, activated_user_id)
);

CREATE INDEX referrals_code_idx ON public.referrals (code);
CREATE INDEX referrals_claim_idx ON public.referrals (claim_id);

CREATE INDEX earning_claims_public_idx
  ON public.earning_claims (claim_type, amount_basis, category, city, state)
  WHERE verification_status = 'approved' AND visibility_status = 'public';

CREATE INDEX mentor_offers_active_idx
  ON public.mentor_offers (claim_id, status);

CREATE INDEX verification_docs_queue_idx
  ON public.verification_docs (review_status, created_at);
