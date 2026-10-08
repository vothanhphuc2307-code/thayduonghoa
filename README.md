# TDH Study Rebuild — Vercel Native

Đây là **rebuild độc lập** dựa trên UI/API mà browser đã expose được từ website gốc. Nó **không chứa source/backend gốc** của `thayduonghoa.com`.

## Stack

- Next.js 16 App Router
- React 19
- Neon Postgres + `@neondatabase/serverless`
- API Route Handlers trong `app/api`
- Cookie session + password hash bằng Node `crypto`
- Không dùng Netlify Functions/Blobs.

Vercel hiện liệt kê Neon là một tích hợp “Vercel Native”; driver serverless chính thức của Neon dùng được cho serverless/edge. Xem docs hiện hành của Vercel/Neon trước khi deploy.

## Những phần đã dựng

- `/dashboard`: shell + dashboard kiểu TDH, EXP/level/gold/diamond/DAME, nhiệm vụ, lớp, bảng xếp hạng.
- `/luyen-nhiem-vu`: 3 mức Cơ bản / Trung bình / Siêu khó.
- `/luyen-nhiem-vu/[id]`: chọn câu, heartbeat, ghi nhận rời màn hình, submit; có endpoint tương thích tên `/luyen-nhiem-vu/bat-dau`, `/{id}/nhip`, `/{id}/roi-man-hinh`, `/{id}/nop`.
- Chấm điểm **server-side**; correct answer không được gửi ra trước submit.
- Siêu khó theo dữ liệu đã quan sát:
  - `difficulty = high_application`
  - 5 câu/lượt
  - tối đa 30 câu đủ thưởng/ngày
  - TN = 8 EXP/câu đúng
  - Đ/S = 15 EXP/câu đúng
  - TLN = 20 EXP/câu đúng
  - +8 vàng/câu đúng
  - vì 5 câu/lượt nên EXP là 40–100 và vàng tối đa 40.
- `/kho-de`: tìm kiếm/lọc kho đề.
- `/lich-su`: lịch sử làm nhiệm vụ.
- `/admin/questions`: CRUD, import JSON, export JSON.
- `/api/health`: health check.
- `ADMIN_TOKEN` hỗ trợ gọi API admin trong test bằng header `x-admin-token`, nhưng secret không được đưa vào frontend.

## Phần nào là dữ liệu nguồn vs rebuild

### Bám theo dữ liệu browser đã thu được

Dashboard snapshot cho thấy sidebar có “Bàn học của em”, “Bài giảng”, “Kiểm tra”, “Luyện đề”, “Luyện nhiệm vụ”, “Lớp học của em”, “Điểm danh”, “Kết quả học tập”, “Bảng xếp hạng”, “Thành tựu”, “Kim cương”, “Cửa hàng”, “Bảng tuần hoàn”, “Cẩm nang”. Audit cũng ghi nhận Inertia/Vite và các biến theme như `--deep`, `--deep-2`, `--app-bg`, `--panel-bg`, `--accent`, cùng font Be Vietnam Pro.

### Chưa xác định từ backend gốc

- Toàn bộ reward của Cơ bản/Trung bình.
- Công thức level/EXP của toàn bộ cấp.
- Toàn bộ API contract của mission UI từng trạng thái.
- Toàn bộ dữ liệu kho đề gốc.

Các phần chưa xác định được để thành **config của rebuild**, không tuyên bố là dữ liệu gốc.

## Setup local

1. Tạo project Next.js / giải nén repo này.
2. Tạo Neon Postgres trên Vercel.
3. Tạo `.env.local` từ `.env.example` và điền `DATABASE_URL`.
4. Chạy `schema.sql` trong Neon SQL Editor.
5. Chạy:

```bash
npm install
npm run db:seed
npm run dev
```

Mặc định seed tạo:
- admin: theo `SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD`
- student: theo `SEED_STUDENT_EMAIL/SEED_STUDENT_PASSWORD`
- vài lớp học + question bank demo.

Không dùng các mật khẩu mặc định trong production.

## Vercel

Import repo lên GitHub → New Project trên Vercel → connect Neon → thêm Environment Variables → Deploy.

Environment cần:
- `DATABASE_URL`
- `ADMIN_TOKEN`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`
- `SEED_STUDENT_EMAIL`
- `SEED_STUDENT_PASSWORD`

Sau khi DB đã có schema, có thể chạy seed local với cùng `DATABASE_URL` hoặc seed qua Neon SQL/tooling của bạn.

## Console collector cho mission UI

File:

`collector/mission-deep-collector.js`

Dán vào DevTools Console **trước khi bấm bắt đầu nhiệm vụ**, sau đó thao tác trên website gốc. Collector sẽ ghi:

- DOM / text / controls
- Inertia `data-page`
- CSS variables
- script/resource URLs
- fetch/XHR method, URL, status
- request body và JSON response body đã redact secret phổ biến
- snapshot sau các bước mission.

Lấy report bằng:

```js
copy(window.__TDH_MISSION_REPORT__())
```

Collector không đọc cookie/localStorage values hay Authorization headers.
