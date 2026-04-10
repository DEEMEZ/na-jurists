-- Fix client access to assigned cases: inside the EXISTS subquery, unqualified `id`
-- was resolved to case_assignments.id (FROM alias `ca`), not cases.id. The predicate
-- ca.case_id = id therefore compared case_id to the wrong UUID and never matched, so
-- clients could read their case_assignments rows but never pass RLS on public.cases
-- (list/detail/embed all returned no case row).

DROP POLICY IF EXISTS cases_select_assigned_or_admin ON public.cases;

CREATE POLICY cases_select_assigned_or_admin
  ON public.cases FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.case_assignments ca
      WHERE ca.case_id = public.cases.id
        AND ca.user_id = auth.uid()
    )
  );
