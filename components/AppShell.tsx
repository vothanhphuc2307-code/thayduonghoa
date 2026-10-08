"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const mainNav = [
  ["/dashboard", "▦", "Bàn học của em"],
  ["/placeholder?name=Bài+giảng", "▤", "Bài giảng"],
  ["/student/kiem-tra", "✓", "Kiểm tra"],
  ["/kho-de", "▱", "Luyện đề"],
  ["/luyen-nhiem-vu", "◎", "Luyện nhiệm vụ"],
  ["/placeholder?name=Lớp+học+của+em", "⌂", "Lớp học của em"],
];

const studyNav = [
  ["/placeholder?name=Điểm+danh", "◷", "Điểm danh"],
  ["/lich-su", "▣", "Kết quả học tập"],
  ["/placeholder?name=Bảng+xếp+hạng", "♜", "Bảng xếp hạng"],
  ["/placeholder?name=Thành+tựu", "☆", "Thành tựu"],
];

const funNav = [
  ["/nhan-vat-cua-em", "◉", "Nhân vật"],
  ["/placeholder?name=Kim+cương", "◇", "Kim cương"],
  ["/placeholder?name=Cửa+hàng", "▤", "Cửa hàng"],
  ["/placeholder?name=Bảng+tuần+hoàn", "◫", "Bảng tuần hoàn"],
  ["/placeholder?name=Cẩm+nang", "⌘", "Cẩm nang"],
];

export default function AppShell({
  user,
  children,
  admin = false,
}: {
  user: {
    name: string;
    email: string;
    role: string;
    level: number;
    exp: number;
    gold: number;
    diamonds: number;
  };
  children: React.ReactNode;
  admin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  function renderNav(items: string[][]) {
    return items.map(([href, icon, label]) => {
      const clean = href.split("?")[0];
      const active =
        clean === pathname ||
        (clean !== "/dashboard" && pathname.startsWith(clean));

      return (
        <Link
          key={label}
          href={href}
          onClick={() => setMobileOpen(false)}
          className={`nav-item${active ? " active" : ""}`}
        >
          <span className="nav-icon" aria-hidden>
            {icon}
          </span>
          <span className="nav-label">{label}</span>
        </Link>
      );
    });
  }

  const NavContent = () => (
    <>
      <div className="brand">
        <div className="brand-logo">
          <img
            src="/brand/logo-v4-32.png"
            width="32"
            height="32"
            alt=""
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="brand-title">Lớp Hóa Thầy Dương</div>
          <div className="brand-sub">Nền tảng học tập</div>
        </div>
      </div>

      <nav className="nav">
        {renderNav(mainNav)}
        <div className="nav-group">Học tập</div>
        {renderNav(studyNav)}
        <div className="nav-group">Học vui</div>
        {renderNav(funNav)}
        <Link
          href="/placeholder?name=Giao+diện"
          className={`nav-item${pathname.startsWith("/placeholder?name=Giao") ? " active" : ""}`}
        >
          <span className="nav-icon">◐</span>
          <span className="nav-label">Giao diện</span>
        </Link>
        <Link
          href="/placeholder?name=Hướng+dẫn"
          className="nav-item"
        >
          <span className="nav-icon">?</span>
          <span className="nav-label">Hướng dẫn</span>
        </Link>

        {admin && (
          <>
            <div className="nav-group">Quản trị</div>
            <Link
              className={`nav-item${pathname.startsWith("/admin") ? " active" : ""}`}
              href="/admin/questions"
            >
              <span className="nav-icon">⚙</span>
              <span className="nav-label">Kho đề / Admin</span>
            </Link>
          </>
        )}
      </nav>

      <div className="sidebar-profile">
        <div className="avatar avatar-lg">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="sidebar-profile-main">
          <div className="sidebar-profile-name">{user.name}</div>
          <div className="sidebar-profile-meta">
            Cấp {user.level} · {user.exp} EXP
          </div>
        </div>
      </div>
    </>
  );

  function submitLookup(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(
      `/placeholder?name=${encodeURIComponent(`Tra mã ${q}`)}`
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavContent />
      </aside>

      {mobileOpen && (
        <>
          <div
            className="overlay"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="drawer">
            <NavContent />
          </aside>
        </>
      )}

      <div className="main-wrap">
        <header className="topbar">
          <div className="toolbar">
            <button
              className="icon-btn mobile-only"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
            >
              ☰
            </button>

            <form className="lookup" onSubmit={submitLookup}>
              <span className="lookup-icon">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tra mã câu / mã đề..."
                aria-label="Tra mã câu / mã đề"
              />
            </form>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-btn"
              onClick={() => {
                document.documentElement.dataset.theme =
                  document.documentElement.dataset.theme === "dark"
                    ? "light"
                    : "dark";
              }}
              aria-label="Đổi giao diện"
            >
              ◐
            </button>
            <button
              className="icon-btn"
              aria-label="Thông báo"
            >
              ♧
            </button>
            <div style={{ position: "relative" }}>
              <button
                className="account-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Tài khoản"
              >
                <span className="avatar">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
              </button>

              {menuOpen && (
                <div className="account-menu">
                  <div className="account-menu-name">
                    {user.name}
                  </div>
                  <div
                    className="muted"
                    style={{
                      fontSize: 12,
                      marginBottom: 10
                    }}
                  >
                    {user.email}
                  </div>
                  <button
                    className="btn btn-ghost"
                    style={{ width: "100%" }}
                    onClick={logout}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          {children}
        </main>

        <nav
          className="mobile-bottom-nav"
          aria-label="Điều hướng di động"
        >
          <Link href="/dashboard" className={pathname === "/dashboard" ? "active" : ""}>
            <span>▦</span><small>Bàn học</small>
          </Link>
          <Link href="/placeholder?name=Bài+giảng">
            <span>▤</span><small>Bài giảng</small>
          </Link>
          <Link href="/student/kiem-tra">
            <span>✓</span><small>Kiểm tra</small>
          </Link>
          <Link href="/kho-de">
            <span>▱</span><small>Luyện đề</small>
          </Link>
          <Link
            href="/luyen-nhiem-vu"
            className={pathname.startsWith("/luyen-nhiem-vu") ? "active" : ""}
          >
            <span>◎</span><small>Nhiệm vụ</small>
          </Link>
          <Link href="/placeholder?name=Lớp+học">
            <span>⌂</span><small>Lớp học</small>
          </Link>
          <Link href="/nhan-vat-cua-em">
            <span>◉</span><small>Nhân vật</small>
          </Link>
        </nav>
      </div>
    </div>
  );
}
