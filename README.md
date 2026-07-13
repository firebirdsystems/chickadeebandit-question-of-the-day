# Question of the Day

One conversation-starter a day (built-in deck of 40 or ask your own). Everyone
answers in secret; answers unlock when the whole household has answered — or
automatically at the end of the day.

- **Storage:** D1 (`rounds`, `answers`, `marks`)
- **Sealing:** `answers` uses `sealed_until` with both a status release
  (round closed) and a hub-enforced clock release (`reveal_at`, end of day);
  `max_per_member` = one answer per member per round; `frozen_when` locks
  answers after the reveal.
- **Marks:** a public "I answered" receipt table (no content) so clients can
  detect when everyone is in and auto-close the round.
- **AI:** intentionally no `ai_access` — personal answers stay out of AI listings.

## Develop

```bash
make install
make dev
make test
make build
```
