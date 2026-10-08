# Deploy checklist

1. `npm install`
2. Tạo Neon DB và lấy `DATABASE_URL`.
3. Chạy `schema.sql`.
4. `npm run db:seed`.
5. `npm run build`.
6. Push lên GitHub.
7. Import GitHub repo vào Vercel.
8. Environment Variables:
   - DATABASE_URL
   - ADMIN_TOKEN
   - SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
   - SEED_STUDENT_EMAIL / SEED_STUDENT_PASSWORD
9. Deploy.
10. Test:
   - `/api/health`
   - `/login`
   - `/dashboard`
   - `/luyen-nhiem-vu`
   - create run → submit → check gold/exp → `/lich-su`
   - admin login → `/admin/questions`
