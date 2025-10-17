-- Create question bank for exams (multiple-choice only)
CREATE TABLE IF NOT EXISTS exam_question_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  answer TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exam_qb_difficulty ON exam_question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_exam_qb_created_at ON exam_question_bank(created_at);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_exam_qb_updated_at BEFORE UPDATE ON exam_question_bank FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (admin writes go through service role)
ALTER TABLE exam_question_bank ENABLE ROW LEVEL SECURITY;

