-- ROLES
CREATE TYPE public.app_role AS ENUM ('student','institution','admin');
CREATE TYPE public.certificate_status AS ENUM ('pending','verified','revoked','rejected');
CREATE TYPE public.upload_source AS ENUM ('self','institution');
CREATE TYPE public.access_request_status AS ENUM ('pending','allowed','denied','expired');
CREATE TYPE public.fraud_case_status AS ENUM ('open','investigating','resolved');

-- INSTITUTIONS
CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  accreditation_id text,
  contact_email text,
  api_key_hash text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institutions TO authenticated;
GRANT ALL ON public.institutions TO service_role;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_id text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  access_key_hash text,
  access_key_last_regenerated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.current_institution_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT institution_id FROM public.profiles WHERE id = auth.uid()
$$;

-- CERTIFICATES
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id text NOT NULL,
  student_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL,
  student_name text NOT NULL,
  degree text,
  department text,
  graduation_year int,
  grade_or_cgpa text,
  issue_date date,
  certificate_hash text,
  qr_code_data text,
  status public.certificate_status NOT NULL DEFAULT 'pending',
  uploaded_by public.upload_source NOT NULL DEFAULT 'self',
  trust_score int NOT NULL DEFAULT 0,
  verification_count int NOT NULL DEFAULT 0,
  last_verified_at timestamptz,
  revocation_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX certificates_certificate_id_idx ON public.certificates (certificate_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- ACCESS REQUESTS
CREATE TABLE public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_name text NOT NULL,
  requester_organization text,
  requester_email text NOT NULL,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_key_used_hash text NOT NULL,
  status public.access_request_status NOT NULL DEFAULT 'pending',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_requests TO authenticated;
GRANT ALL ON public.access_requests TO service_role;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  target_id text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- FRAUD CASES
CREATE TABLE public.fraud_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid REFERENCES public.certificates(id) ON DELETE CASCADE,
  issue_description text NOT NULL,
  status public.fraud_case_status NOT NULL DEFAULT 'open',
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fraud_cases TO authenticated;
GRANT ALL ON public.fraud_cases TO service_role;
ALTER TABLE public.fraud_cases ENABLE ROW LEVEL SECURITY;

-- RATE LIMIT
CREATE TABLE public.verify_rate_limits (
  ip_address text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count int NOT NULL DEFAULT 0
);
GRANT ALL ON public.verify_rate_limits TO service_role;
ALTER TABLE public.verify_rate_limits ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_self_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "institutions_read" ON public.institutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "institutions_admin_write" ON public.institutions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "certificates_select" ON public.certificates FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'institution') AND institution_id = public.current_institution_id())
  );
CREATE POLICY "certificates_student_insert" ON public.certificates FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'institution') AND institution_id = public.current_institution_id()));
CREATE POLICY "certificates_privileged_update" ON public.certificates FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'institution') AND institution_id = public.current_institution_id()))
  WITH CHECK (public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'institution') AND institution_id = public.current_institution_id()));

CREATE POLICY "access_requests_student_select" ON public.access_requests FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "access_requests_student_update" ON public.access_requests FOR UPDATE TO authenticated
  USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());

CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "fraud_cases_admin" ON public.fraud_cases FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PUBLIC VERIFICATION (status only, rate limited)
CREATE OR REPLACE FUNCTION public.public_verify_certificate(_certificate_id text, _ip text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count int;
  v_status public.certificate_status;
BEGIN
  INSERT INTO public.verify_rate_limits (ip_address, window_start, request_count)
  VALUES (_ip, now(), 1)
  ON CONFLICT (ip_address) DO UPDATE SET
    window_start = CASE WHEN public.verify_rate_limits.window_start < now() - interval '1 minute'
                        THEN now() ELSE public.verify_rate_limits.window_start END,
    request_count = CASE WHEN public.verify_rate_limits.window_start < now() - interval '1 minute'
                        THEN 1 ELSE public.verify_rate_limits.request_count + 1 END
  RETURNING request_count INTO v_count;

  IF v_count > 15 THEN
    RETURN 'RATE_LIMITED';
  END IF;

  UPDATE public.certificates
     SET verification_count = verification_count + 1, last_verified_at = now()
   WHERE upper(certificate_id) = upper(trim(_certificate_id))
  RETURNING status INTO v_status;

  IF v_status IS NULL THEN
    RETURN 'NOT_FOUND';
  ELSIF v_status = 'revoked' THEN
    RETURN 'REVOKED';
  ELSIF v_status = 'verified' THEN
    RETURN 'VERIFIED';
  ELSE
    RETURN 'PENDING';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.public_verify_certificate(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_verify_certificate(text, text) TO anon, authenticated, service_role;