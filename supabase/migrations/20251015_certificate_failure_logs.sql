-- Certificate failure logs for analysis and retry
CREATE TABLE IF NOT EXISTS certificate_failure_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  course_id UUID,
  stage TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_code TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cfl_created_at ON certificate_failure_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cfl_user ON certificate_failure_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_cfl_course ON certificate_failure_logs(course_id);

ALTER TABLE certificate_failure_logs ENABLE ROW LEVEL SECURITY;

