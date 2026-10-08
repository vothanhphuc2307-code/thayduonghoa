# Source basis / evidence ledger

## Confirmed from browser audit

- Current snapshot URL: `https://thayduonghoa.com/dashboard`.
- Framework hints: `Inertia` + `Vite/build-assets`.
- Public asset pattern includes Vite build CSS/JS and public logo assets.
- Dashboard sidebar labels and shell structure were observed in the rendered page.
- Theme variables include `--deep`, `--deep-2`, `--app-bg`, `--panel-bg`, `--accent`, `--blue-700`, `--mint`, `--coin`, `--radius-card`, `--radius-control`, `--font-sans`.
- The HTML contains an Inertia `data-page` payload with auth/navigation/decor/quiz/pwa props.

## Confirmed from prior network observations supplied with the project context

- `POST /luyen-nhiem-vu/bat-dau`
- `POST /luyen-nhiem-vu/{run_id}/nhip`
- `POST /luyen-nhiem-vu/{run_id}/roi-man-hinh`
- `POST /luyen-nhiem-vu/{run_id}/nop`
- `GET /luyen-nhiem-vu`
- `POST /activity/heartbeat`
- `GET /api/notifications`
- `GET /student/support/unread-count`

High application:
- `difficulty=high_application`
- 5 questions per run
- daily 30-question reward cap
- TN 8 EXP
- Đ/S 15 EXP
- TLN 20 EXP
- 8 gold per correct
- run range 40–100 EXP, 40 gold for a 5-question run when all are scored for gold

## Not claimed / unknown

The original source/backend is not restored. The rebuild therefore does not claim to know:
- hidden backend code or database schema;
- exact Cơ bản/Trung bình rewards;
- exact full level/EXP formula;
- complete mission API response shape for every state;
- complete original question bank;
- exact admin APIs.

Unknown values are implemented as rebuild configuration and marked as such in `lib/config.ts` or the README.
