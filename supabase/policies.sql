-- RLS policies for Verified Earnings MVP.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earning_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND is_admin = true
  );
$$;

CREATE POLICY "Public profiles are readable"
ON public.users FOR SELECT
USING (true);

CREATE POLICY "Users manage themselves"
ON public.users FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Approved public claims are readable"
ON public.earning_claims FOR SELECT
USING (
  (verification_status = 'approved' AND visibility_status = 'public')
  OR user_id = auth.uid()
  OR public.current_user_is_admin()
);

CREATE POLICY "Users create their own claims"
ON public.earning_claims FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update private non-approved claims"
ON public.earning_claims FOR UPDATE
USING (user_id = auth.uid() AND visibility_status <> 'public')
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins update claim review fields"
ON public.earning_claims FOR UPDATE
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Users read their own verification docs"
ON public.verification_docs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.earning_claims
    WHERE earning_claims.id = verification_docs.claim_id
      AND earning_claims.user_id = auth.uid()
  )
  OR public.current_user_is_admin()
);

CREATE POLICY "Users create docs for their own claims"
ON public.verification_docs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.earning_claims
    WHERE earning_claims.id = verification_docs.claim_id
      AND earning_claims.user_id = auth.uid()
  )
);

CREATE POLICY "Admins update verification docs"
ON public.verification_docs FOR UPDATE
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Active mentor offers are readable"
ON public.mentor_offers FOR SELECT
USING (status = 'active' OR user_id = auth.uid() OR public.current_user_is_admin());

CREATE POLICY "Users manage own mentor offers"
ON public.mentor_offers FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage their follows"
ON public.follows FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage their saved items"
ON public.saved_items FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users read own sessions"
ON public.sessions FOR SELECT
USING (mentor_id = auth.uid() OR mentee_id = auth.uid() OR public.current_user_is_admin());

CREATE POLICY "Users create sessions as mentees"
ON public.sessions FOR INSERT
WITH CHECK (mentee_id = auth.uid());

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referral owner reads own referrals"
ON public.referrals FOR SELECT
USING (creator_user_id = auth.uid() OR public.current_user_is_admin());

CREATE POLICY "System creates referrals"
ON public.referrals FOR INSERT
WITH CHECK (creator_user_id = auth.uid() OR public.current_user_is_admin());

CREATE POLICY "Referral owner reads activations"
ON public.referral_activations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.referrals
    WHERE referrals.id = referral_activations.referral_id
      AND referrals.creator_user_id = auth.uid()
  ) OR public.current_user_is_admin()
);

CREATE POLICY "Authenticated users can activate referrals"
ON public.referral_activations FOR INSERT
WITH CHECK (activated_user_id = auth.uid());

-- Storage bucket should be created as private in Supabase:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('verification-docs', 'verification-docs', false, 10485760, ARRAY['application/pdf','image/jpeg','image/png']);
--
-- Storage object policies should restrict object reads to admins and claim owners through signed URLs generated server-side.
