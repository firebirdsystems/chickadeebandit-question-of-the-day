-- Rounds now expire a year after their question_date, cascading answers and
-- marks. question_date is already plaintext (db_plaintext_columns) because the
-- app sorts on it; this index covers the runner's age scan plus the id it
-- deletes on.
CREATE INDEX IF NOT EXISTS app_question_of_the_day__rounds_retention_idx
  ON app_question_of_the_day__rounds (question_date, id);
