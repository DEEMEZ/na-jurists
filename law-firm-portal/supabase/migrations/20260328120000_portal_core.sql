-- Law firm portal: schema + RLS + storage (replaces custom Node/Prisma API for browser access).
-- Run in Supabase SQL Editor or via `supabase db push`.
-- After first signup: UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'your@email.com';

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('ADMIN', 'CLIENT')),
  disabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 'CLIENT');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email, updated_at = NOW() WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_email();

-- ---------------------------------------------------------------------------
-- Domain tables (UUID ids)
-- ---------------------------------------------------------------------------
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.case_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  UNIQUE (case_id, user_id)
);

CREATE INDEX case_assignments_user_id_idx ON public.case_assignments (user_id);
CREATE INDEX case_assignments_case_id_idx ON public.case_assignments (case_id);

CREATE TABLE public.case_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases (id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles (id),
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX case_status_history_case_id_idx ON public.case_status_history (case_id);

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases (id) ON DELETE CASCADE,
  uploaded_by_id UUID NOT NULL REFERENCES public.profiles (id),
  original_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX documents_case_id_idx ON public.documents (case_id);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_id_idx ON public.notifications (user_id);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles (id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX messages_case_id_idx ON public.messages (case_id);

CREATE TABLE public.hearings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases (id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  venue TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX hearings_case_id_idx ON public.hearings (case_id);

CREATE TABLE public.hearing_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hearing_id UUID NOT NULL REFERENCES public.hearings (id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (hearing_id, kind)
);

-- ---------------------------------------------------------------------------
-- Helpers for RLS (SECURITY DEFINER reads auth.uid())
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'ADMIN'
      AND p.disabled = FALSE
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_case(p_case_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.case_assignments ca
      WHERE ca.case_id = p_case_id
        AND ca.user_id = auth.uid()
    );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearing_reminders ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_select_own_or_admin
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_update_admin
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- cases
CREATE POLICY cases_select_assigned_or_admin
  ON public.cases FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.case_assignments ca
      WHERE ca.case_id = id AND ca.user_id = auth.uid()
    )
  );

CREATE POLICY cases_insert_admin
  ON public.cases FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY cases_update_admin
  ON public.cases FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY cases_delete_admin
  ON public.cases FOR DELETE TO authenticated
  USING (public.is_admin());

-- case_assignments
CREATE POLICY case_assignments_select
  ON public.case_assignments FOR SELECT TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());

CREATE POLICY case_assignments_write_admin
  ON public.case_assignments FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY case_assignments_delete_admin
  ON public.case_assignments FOR DELETE TO authenticated
  USING (public.is_admin());

-- case_status_history
CREATE POLICY status_history_select
  ON public.case_status_history FOR SELECT TO authenticated
  USING (public.can_access_case(case_id));

CREATE POLICY status_history_insert_admin
  ON public.case_status_history FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND author_id = auth.uid());

-- documents
CREATE POLICY documents_select
  ON public.documents FOR SELECT TO authenticated
  USING (public.can_access_case(case_id));

CREATE POLICY documents_insert_admin
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() AND uploaded_by_id = auth.uid());

CREATE POLICY documents_delete_admin
  ON public.documents FOR DELETE TO authenticated
  USING (public.is_admin());

-- notifications
CREATE POLICY notifications_select_own
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY notifications_update_own
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_insert_admin
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- messages
CREATE POLICY messages_select
  ON public.messages FOR SELECT TO authenticated
  USING (public.can_access_case(case_id));

CREATE POLICY messages_insert
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    public.can_access_case(case_id)
    AND sender_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.disabled
    )
  );

-- hearings
CREATE POLICY hearings_select
  ON public.hearings FOR SELECT TO authenticated
  USING (public.can_access_case(case_id));

CREATE POLICY hearings_insert_admin
  ON public.hearings FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY hearings_update_admin
  ON public.hearings FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY hearings_delete_admin
  ON public.hearings FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY hearing_reminders_select_admin
  ON public.hearing_reminders FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY hearing_reminders_insert_admin
  ON public.hearing_reminders FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY hearing_reminders_delete_admin
  ON public.hearing_reminders FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage (private bucket; path: {case_id}/{uuid}_{filename})
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-files', 'case-files', FALSE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY case_files_select
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'case-files'
    AND public.can_access_case(split_part(name, '/', 1)::uuid)
  );

CREATE POLICY case_files_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'case-files'
    AND public.is_admin()
  );

CREATE POLICY case_files_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'case-files'
    AND public.is_admin()
  );
