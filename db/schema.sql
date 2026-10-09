CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration_minutes INTEGER NOT NULL DEFAULT 45 CHECK (duration_minutes BETWEEN 1 AND 360),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_sample BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 1,
  prompt TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'single_choice'
    CHECK (question_type IN ('single_choice','multi_choice','short_answer')),
  points NUMERIC(7,2) NOT NULL DEFAULT 1 CHECK (points >= 0),
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  answer_key JSONB NOT NULL DEFAULT '[]'::jsonb,
  accepted_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  score NUMERIC(9,2) NOT NULL DEFAULT 0,
  max_score NUMERIC(9,2) NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS exams_published_idx ON exams(is_published, subject);
CREATE INDEX IF NOT EXISTS questions_exam_sort_idx ON questions(exam_id, sort_order);
CREATE INDEX IF NOT EXISTS attempts_user_date_idx ON attempts(user_id, submitted_at DESC);
