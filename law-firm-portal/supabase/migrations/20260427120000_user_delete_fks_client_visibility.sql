-- Fix user deletion: FKs from profiles must not block auth.users delete (profiles CASCADE from auth).
-- Add admin-controlled visibility for clients on status history, documents, and optional case notes.

-- ---------------------------------------------------------------------------
-- Relax FKs so deleting a profile/user does not fail on authored rows
-- ---------------------------------------------------------------------------
ALTER TABLE public.case_status_history ALTER COLUMN author_id DROP NOT NULL;

ALTER TABLE public.case_status_history
  DROP CONSTRAINT IF EXISTS case_status_history_author_id_fkey;

ALTER TABLE public.case_status_history
  ADD CONSTRAINT case_status_history_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles (id) ON DELETE SET NULL;

ALTER TABLE public.documents ALTER COLUMN uploaded_by_id DROP NOT NULL;

ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_uploaded_by_id_fkey;

ALTER TABLE public.documents
  ADD CONSTRAINT documents_uploaded_by_id_fkey
  FOREIGN KEY (uploaded_by_id) REFERENCES public.profiles (id) ON DELETE SET NULL;

ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES public.profiles (id) ON DELETE CASCADE;

-- ---------------------------------------------------------------------------
-- Visibility columns (default TRUE preserves existing behaviour)
-- ---------------------------------------------------------------------------
ALTER TABLE public.case_status_history
  ADD COLUMN IF NOT EXISTS visible_to_client BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS visible_to_client BOOLEAN NOT NULL DEFAULT TRUE;

-- ---------------------------------------------------------------------------
-- Case notes (admin-authored; optional visibility to assigned clients)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  case_id UUID NOT NULL REFERENCES public.cases (id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  visible_to_client BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS case_notes_case_id_idx ON public.case_notes (case_id);

ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS: clients only see rows explicitly shared with them
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS status_history_select ON public.case_status_history;

CREATE POLICY status_history_select ON public.case_status_history FOR SELECT TO authenticated USING (
  public.is_admin()
  OR (
    public.can_access_case(case_id)
    AND visible_to_client = TRUE
  )
);

DROP POLICY IF EXISTS documents_select ON public.documents;

CREATE POLICY documents_select ON public.documents FOR SELECT TO authenticated USING (
  public.is_admin()
  OR (
    public.can_access_case(case_id)
    AND visible_to_client = TRUE
  )
);

DROP POLICY IF EXISTS case_notes_select ON public.case_notes;

CREATE POLICY case_notes_select ON public.case_notes FOR SELECT TO authenticated USING (
  public.is_admin()
  OR (
    public.can_access_case(case_id)
    AND visible_to_client = TRUE
  )
);

DROP POLICY IF EXISTS case_notes_insert_admin ON public.case_notes;

CREATE POLICY case_notes_insert_admin ON public.case_notes FOR INSERT TO authenticated
WITH CHECK (public.is_admin() AND author_id = auth.uid());

DROP POLICY IF EXISTS case_notes_delete_admin ON public.case_notes;

CREATE POLICY case_notes_delete_admin ON public.case_notes FOR DELETE TO authenticated USING (public.is_admin());
