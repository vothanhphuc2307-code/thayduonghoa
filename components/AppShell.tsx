 "use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const mainNav = [
  ["/dashboard", "▦", "Bàn học của em"],
  ["/placeholder?name=Bài+giảng", "▤", "Bài giảng"],
  ["/placeholder?name=Kiểm+tra", "✓", "Kiểm tra"],
  ["/kho-de", "▱", "Luyện đề"],
  ["/luyen-nhiem-vu", "◎", "Luyện nhiệm vụ"],
  ["/placeholder?name=Lớp+học+của+em", "⌂", "Lớp học của em"],
  ["/placeholder?name=Điểm+danh", "◷", "Điểm danh"],
  ["/lich-su", "▣", "Kết quả học tập"],
  ["/placeholder?name=Bảng+xếp+hạng", "♜", "Bảng xếp hạng"],
  ["/placeholder?name=Thành+tựu", "✦", "Thành tựu"],
];

const funNav = [
  ["/placeholder?name=Kim+cương", "◇", "Kim cương"],
  ["/placeholder?name=Cửa+hàng", "▤", "Cửa hàng"],
  ["/placeholder?name=Bảng+tuần+hoàn", "◫", "Bảng tuần hoàn"],
  ["/placeholder?name=Cẩm+nang", "⌘", "Cẩm nang"],
];

export default function AppShell({
  user,
  children,
  admin = false
}: {
  user: { name: string; email: string; role: string; level: number; exp: number; gold: number; diamonds: number };
  children: React.ReactNode;
  admin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nav = (items: string[][]) => items.map(([href, icon, label]) => {
    const clean = href.split("?")[0];
    const active = clean === pathname || (clean !== "/dashboard" && pathname.startsWith(clean));
    return (
      <Link key={label} href={href} onClick={() => setMobileOpen(false)} className={`nav-item${active ? " active" : ""}`}>
        <span className="nav-icon" aria-hidden>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
      </Link>
    );
  });

  const NavContent = () => (
    <>
      <div className="brand">
        <div className="brand-mark">H</div>
        <div style={{ minWidth: 0 }}>
          <div className="brand-title">Lớp Hóa Thầy Dương</div>
          <div className="brand-sub">Nền tảng học tập</div>
        </div>
      </div>
      <nav className="nav">
        {nav(mainNav)}
        <div className="nav-group">HỌC VUI</div>
        {nav(funNav)}
        {admin && (
          <>
            <div className="nav-group">QUẢN TRỊ</div>
            <Link className={`nav-item${pathname.startsWith("/admin") ? " active" : ""}`} href="/admin/questions">
              <span className="nav-icon">⚙</span><span>Kho đề / Admin</span>
            </Link>
          </>
        )}
      </nav>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar"><NavContent /></aside>
      {mobileOpen && (
        <>
          <div className="overlay" onClick={() => setMobileOpen(false)} />
          <aside className="drawer"><NavContent /></aside>
        </>
      )}
      <div className="main-wrap">
        <header className="topbar">
          <div className="toolbar">
            <button className="icon-btn mobile-only" onClick={() => setMobileOpen(true)} aria-label="Mở menu">☰</button>
            <span className="muted" style={{ fontWeight: 700 }}>Tra mã câu / mã đề</span>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" onClick={() => {
              const root = document.documentElement;
              root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
            }} aria-label="Đổi giao diện">◐</button>
            <button className="icon-btn" aria-label="Thông báo">♧</button>
            <div style={{ position: "relative" }}>
              <button className="account-btn" onClick={() => setMenuOpen(v => !v)}>
                <span className="avatar">{user.name.slice(0,1).toUpperCase()}</span>
                <span style={{ fontWeight: 800, fontSize: 13 }}>{user.name}</span>
              </button>
              {menuOpen && (
                <div className="card card-pad" style={{ position: "absolute", right: 0, top: 46, width: 210, zIndex: 60 }}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{user.email}</div>
                  <button className="btn btn-ghost" style={{ width: "100%" }} onClick={logout}>Đăng xuất</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
