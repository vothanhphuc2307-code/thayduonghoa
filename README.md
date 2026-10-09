# DOL THPT — bản phục dựng độc lập

> **Đọc trước:** Đây không phải repository gốc của `dolthpt.vn`, không khôi phục được backend/database gốc và không chứa dữ liệu học viên thật. ZIP nguồn do trình duyệt thu thập có cả phản hồi API/phiên đăng nhập nên **đã không được đưa nguyên trạng vào repository này**. Các đề được tạo bởi `npm run db:init` đều là dữ liệu minh họa.

## Có gì trong dự án?

- Next.js App Router, responsive UI tiếng Việt.
- PostgreSQL: tài khoản, vai trò `student/admin`, kho đề, câu hỏi, lịch sử làm bài.
- Đăng ký/đăng nhập thật; mật khẩu băm bằng bcrypt; phiên đăng nhập là cookie `HttpOnly`/`SameSite=Lax`, `Secure` ở production.
- Chấm điểm được thực hiện ở backend; API lấy đề không gửi đáp án đúng trước khi nộp.
- Khu vực admin: xem đề, tạo đề với câu hỏi JSON, xuất bản/ẩn đề.
- Script `tools/dolthpt-public-crawler.js` để thu thập **metadata giao diện công khai** từ trình duyệt; không lấy cookie, token, mật khẩu, raw HTML hay dữ liệu API.

## A. Chạy thử trên Windows (dùng Docker Desktop)

### 1. Cài công cụ

1. Cài **Node.js 22 LTS hoặc mới hơn** (bản hỗ trợ Next.js trong `package.json`).
2. Cài **Docker Desktop** và mở cho trạng thái Running.
3. Giải nén ZIP vào một thư mục dễ tìm, ví dụ `C:\dolthpt-github`.

### 2. Tạo cấu hình local

1. Mở thư mục dự án.
2. Sao chép `.env.example` thành `.env`.
3. Đổi `SESSION_SECRET` thành chuỗi ngẫu nhiên dài ít nhất 32 ký tự.
4. Đổi `ADMIN_EMAIL` và `ADMIN_PASSWORD` thành email/mật khẩu quản trị riêng; mật khẩu admin nên dài từ 14 ký tự.

Cấu hình PostgreSQL trong `.env.example` dành cho database local trong Docker.

### 3. Mở terminal trong thư mục dự án và chạy

```powershell
docker compose up -d --wait
npm install
npm run db:init
npm run dev
```

Mở `http://localhost:3000`. Lệnh `npm run db:init` tạo các bảng, tạo admin từ biến môi trường và thêm vài đề **minh họa** nếu chúng chưa tồn tại. Nếu bạn sửa `ADMIN_PASSWORD` sau khi admin đã tạo, script không tự đổi password hiện có.

Muốn dừng database local: `docker compose down`. Dữ liệu vẫn giữ trong volume. Xóa sạch dữ liệu local thì phải chủ động xóa volume `dolthpt_pgdata`—không làm điều này nếu muốn giữ bài làm.

## B. Đẩy lên GitHub

1. Tạo repository mới trên GitHub, ưu tiên **Private** trong lúc phát triển.
2. Giải nén ZIP; không đưa ZIP snapshot nguồn vào repository.
3. Tải toàn bộ thư mục dự án này lên repo hoặc dùng GitHub Desktop.
4. Kiểm tra `.env` không được upload. `.gitignore` đã chặn `.env`, `.env.local` và thư mục build.

GitHub là nơi lưu mã nguồn; để website chạy online, hãy triển khai app trên một dịch vụ hosting Node.js như Vercel và kết nối repo. Xem phần C.

## C. Triển khai online bằng Vercel + PostgreSQL (Neon hoặc provider tương đương)

1. Tạo PostgreSQL database mới từ nhà cung cấp bạn kiểm soát. **Không kết nối vào database DOL THPT cũ** khi chưa xác định được quyền truy cập và đã sao lưu.
2. Sao chép connection string dạng `postgresql://...` từ trang quản lý database. Với serverless, ưu tiên pooled connection string nếu nhà cung cấp hỗ trợ.
3. Import repository từ GitHub vào Vercel. Chọn framework Next.js, giữ root directory là `/`.
4. Trong Vercel → Project → Settings → Environment Variables, thêm:
   - `DATABASE_URL` = connection string của database **mới**.
   - `SESSION_SECRET` = một chuỗi bí mật ngẫu nhiên dài ít nhất 32 ký tự.
   - `ADMIN_EMAIL` = email admin muốn tạo ban đầu.
   - `ADMIN_PASSWORD` = mật khẩu admin ngẫu nhiên, dài ít nhất 14 ký tự.
5. Deploy. Trên máy Windows, cài Vercel CLI (`npm i -g vercel`), mở terminal trong thư mục dự án và chạy `vercel link` để liên kết đúng project. Sau đó chạy `vercel env pull .env.local --environment=production` để tải biến môi trường về máy local (file này đang bị Git ignore). Chạy `npm run db:init` một lần để tạo schema/admin/đề mẫu trên database mới. Xóa `.env.local` khỏi máy dùng chung sau khi hoàn tất. **Không đưa DATABASE_URL hoặc SESSION_SECRET lên chat/GitHub.**
6. Đăng nhập admin bằng thông tin vừa cấu hình; tạo đề, kiểm tra xuất bản/ẩn đề, tạo tài khoản học viên, nộp bài và xem lịch sử.

> Vercel không tự chạy `npm run db:init` chỉ vì bạn đặt biến môi trường. Hãy chạy script chủ động một lần trên database mới. Trước khi cho học viên thật sử dụng, cần bổ sung rate limiting dùng chung cho serverless, email verification/reset password, backup tự động, logging/monitoring và rà soát bảo mật độc lập.

## D. Crawler giao diện công khai

Mở `https://dolthpt.vn/` bằng cửa sổ ẩn danh hoặc sau khi đăng xuất (để tránh nội dung cá nhân xuất hiện trong DOM hiện tại). Mở DevTools → Console, dán nội dung `tools/dolthpt-public-crawler.js` rồi Enter. Script sẽ dò sitemap/liên kết cùng tên miền, thu thập giới hạn tối đa 80 trang và tải `dolthpt-public-crawl.json`.

Crawler chỉ dùng GET, cùng origin, `credentials: omit`; bỏ qua các route nghi là API/tài khoản/quản trị. Nó lưu tiêu đề, tiêu đề mục, văn bản công khai đã rút gọn, liên kết và tham chiếu file CSS/JS/ảnhkhông lưu nguyên mã nguồn JavaScript/CSS hay raw HTML. Không thể khôi phục backend hoặc database chỉ bằng crawler. Một số trang tải dữ liệu bằng JavaScript có thể không có đủ nội dung trong báo cáo. Đừng sửa script để lấy token/cookie/response riêng tư và đừng tải snapshot chứa phiên đăng nhập lên repo công khai.

## E. Dữ liệu mẫu và giới hạn hiện tại

- Những câu hỏi được seed chỉ để kiểm thử chức năng, **không phải đề thi thật hoặc dữ liệu lấy lại từ hệ thống gốc**.
- Không có tích hợp xác thực `auth-v2.dolthpt.vn` hay các API `dolenglish.vn` của hệ thống cũ.
- Chưa có nhập file PDF/Word hàng loạt, thanh toán, gửi email, xác minh email, quên mật khẩu hoặc đồng bộ dữ liệu gốc.
- API đăng nhập hiện có kiểm tra thông tin và cookie an toàn cơ bản nhưng chưa tích hợp rate-limit phân tán; không mở cho lượng lớn người dùng thật trước khi bổ sung lớp này.
- Để giữ dữ liệu bền vững khi deploy, phải dùng database PostgreSQL bên ngoài; filesystem của deployment không phải nơi lưu database.

## F. Backup và phục hồi

Trước khi sửa schema hoặc nhập dữ liệu thật, sao lưu PostgreSQL bằng công cụ `pg_dump`/backup từ nhà cung cấp. Lưu file backup ở vị trí riêng, hạn chế quyền truy cập, thử restore sang một database thử nghiệm. Migration/schema trong repo này không được tự động áp lên server DOL THPT gốc.

## License / nguồn gốc

Mã nguồn trong gói này là một bản triển khai độc lập mới. Tài nguyên crawl gốc không được nhúng nhằm tránh công khai session/API data và vì snapshot trình duyệt không phải source repository. Chỉ thêm tài nguyên thương hiệu, câu hỏi và hình ảnh vào repository khi bạn có quyền sử dụng chúng.
