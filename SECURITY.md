# Security notes

- Never commit `.env`, database URLs, JWT/session secrets, cookies, access tokens, user exports or raw browser-crawl ZIPs.
- Use a new database for this rebuild; don't point it at the original production system while identity/data ownership is unresolved.
- Admin role is assigned only by the initial setup script or a controlled database operation. Public registration always creates `student`.
- Passwords are hashed using bcryptjs; they are not stored in plaintext.
- Exam answer keys are selected only from the database on submit; public exam GET omits answer keys.
- Cookie: HttpOnly, SameSite=Lax, Secure in production. Rotate SESSION_SECRET if it is ever exposed; this invalidates existing sessions.
- Before real traffic, add distributed rate limiting, password reset/email verification, audit logs, monitoring, automatic backups and a security review.
- The included crawler is intended for public frontend metadata. It deliberately does not collect browser cookies/storage, tokens, API bodies, account pages or raw HTML.
