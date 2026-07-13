-- Question of the Day — daily conversation starter with sealed answers.
--
-- `rounds` is one question instance. Any member (kids included) may post a
-- question; rounds are household-visible (`visibility = 'everyone'`) and
-- governed by owner_or_visibility + write_visibility_scoped, so the visible
-- audience co-edits (anyone may close a round; closing early only releases
-- answers already submitted, which the closer could also get by waiting).
--
-- `answers` is the sealed table: `sealed_until` (manifest.json) keeps each
-- member's answer visible only to its writer until the round's `status`
-- becomes 'closed' OR the hub clock passes `reveal_at` (end of the question's
-- day) — hub-enforced, so raw /api/db cannot peek early. `max_per_member`
-- enforces one answer per member per round, and `frozen_when` freezes answers
-- once the round closes. Answer text stays encrypted at rest.
--
-- `marks` is the public "I answered" receipt (no answer content): sealed rows
-- are invisible to others, so without marks the app couldn't know when
-- everyone has answered. Marks inherit the round's visibility; one per member
-- per round. When marks count reaches the household size, any client closes
-- the round, releasing the answers.
--
-- `question_date` is plaintext (manifest db_plaintext_columns) for sorting;
-- `reveal_at` is `_at`-suffixed so already plaintext (sealed_until compares it).
CREATE TABLE IF NOT EXISTS app_question_of_the_day__rounds (
  id            TEXT PRIMARY KEY,
  question      TEXT NOT NULL,
  question_date TEXT NOT NULL,                    -- ISO YYYY-MM-DD (one round per day by convention)
  reveal_at     TEXT NOT NULL,                    -- ISO datetime: end of the question's day
  status        TEXT NOT NULL DEFAULT 'open',     -- open|closed
  source        TEXT NOT NULL DEFAULT 'deck',     -- deck|custom
  visibility    TEXT NOT NULL DEFAULT 'everyone',
  created_by    TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_question_of_the_day__answers (
  id          TEXT PRIMARY KEY,
  round_id    TEXT NOT NULL,
  member_id   TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  FOREIGN KEY (round_id) REFERENCES app_question_of_the_day__rounds(id) ON DELETE CASCADE,
  UNIQUE (round_id, member_id)
);

CREATE TABLE IF NOT EXISTS app_question_of_the_day__marks (
  id         TEXT PRIMARY KEY,
  round_id   TEXT NOT NULL,
  member_id  TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (round_id) REFERENCES app_question_of_the_day__rounds(id) ON DELETE CASCADE,
  UNIQUE (round_id, member_id)
);

CREATE INDEX IF NOT EXISTS app_question_of_the_day__rounds_date_idx
  ON app_question_of_the_day__rounds (question_date);

CREATE INDEX IF NOT EXISTS app_question_of_the_day__answers_round_idx
  ON app_question_of_the_day__answers (round_id);

CREATE INDEX IF NOT EXISTS app_question_of_the_day__marks_round_idx
  ON app_question_of_the_day__marks (round_id);
