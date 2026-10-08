import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export default async function CharacterPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell user={user} admin={user.role === "admin"}>
      <section className="page-banner card card-pad">
        <div className="kicker">HỌC VUI</div>
        <h1 className="h1">Nhân vật của em</h1>
        <p className="muted">
          PET, trang phục, khung và danh hiệu. Bản rebuild đã có shell để nối
          kho vật phẩm và hệ DAME/EXP.
        </p>
      </section>

      <section className="character-grid section">
        <div className="character-preview card">
          <div className="character-orbit">
            <div className="character-avatar">{user.name.slice(0, 1).toUpperCase()}</div>
          </div>
          <div className="character-name">{user.name}</div>
          <div className="muted">Cấp {user.level} · {user.exp} EXP</div>
        </div>
        <div className="card card-pad">
          <div className="section-head">
            <div>
              <div className="kicker">Trang phục</div>
              <h2 className="h2">Bộ sưu tập</h2>
            </div>
            <span className="badge badge-gold">{user.gold.toLocaleString("vi-VN")} vàng</span>
          </div>
          <div className="collection-grid">
            {["Mặc định", "Đại dương", "Bạc hà", "Oải đào"].map((name, i) => (
              <div key={name} className={`collection-item${i === 0 ? " selected" : ""}`}>
                <div className="collection-art">✦</div>
                <div className="task-title">{name}</div>
                <div className="task-sub">{i === 0 ? "Đang dùng" : "Mở trong cửa hàng"}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
