ALTER TABLE public.plus_access_requests
DROP CONSTRAINT IF EXISTS plus_access_requests_status_check;

ALTER TABLE public.plus_access_requests
ADD CONSTRAINT plus_access_requests_status_check
CHECK (status IN ('new', 'waiting_payment', 'waiting_account', 'follow_up', 'approved', 'rejected', 'completed'));

CREATE TABLE IF NOT EXISTS public.question_issue_reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
    user_id     UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
    reason      TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_issue_reports_status_created
    ON public.question_issue_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_issue_reports_question_id
    ON public.question_issue_reports (question_id);
