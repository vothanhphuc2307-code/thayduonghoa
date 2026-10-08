"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CHAPTERS, DIFFICULTIES } from "@/lib/config";

const configs = [
  DIFFICULTIES.basic,
  DIFFICULTIES.medium,
  DIFFICULTIES.hard,
  DIFFICULTIES.high_application,
] as const;

export default function MissionSetup() {
  const [chapter, setChapter] = useState("c12-1");
  const [difficulty, setDifficulty] = useState("high_application");
  const [mode, setMode] = useState<"normal" | "quiz">("normal");
  const [savedTab, setSavedTab] = useState<"review" | "saved">("review");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const selected = useMemo(
    () => configs.find((x) => x.key === difficulty) ?? configs[3],
    [difficulty]
  );

  async function start() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/missions/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chapter, difficulty, quiz: mode === "quiz" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không bắt đầu được");
      router.push(`/luyen-nhiem-vu/${data.run.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không bắt đầu được");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="mission-head-card">
        <div className="mission-head-top">
          <div>
            <div className="kicker">Kiểu làm</div>
            <div className="mode-tabs" role="tablist" aria-label="Kiểu làm">
              <button
                className={`mode-tab${mode === "normal" ? " active" : ""}`}
                onClick={() => setMode("normal")}
                type="button"
              >
                Thường
              </button>
              <button
                className={`mode-tab${mode === "quiz" ? " active" : ""}`}
                onClick={() => setMode("quiz")}
                type="button"
              >
                Quiz
              </button>
            </div>
          </div>
          <div className="mission-stats">
            Tăng câu, thiết lập ôn lại · giải nhanh · thời gian
          </div>
        </div>

        <div className="section-head mission-save-head">
          <div>
            <h2 className="h2">Câu đã lưu</h2>
            <div className="muted" style={{ fontSize: 12 }}>
              Tăng câu, thiết lập ôn lại và giải nhanh
            </div>
          </div>
          <div className="pill-tabs">
            <button
              className={`pill${savedTab === "review" ? " active" : ""}`}
              type="button"
              onClick={() => setSavedTab("review")}
            >
              Ôn câu đã lưu
            </button>
            <button
              className={`pill${savedTab === "saved" ? " active" : ""}`}
              type="button"
              onClick={() => setSavedTab("saved")}
            >
              Câu đã lưu (0)
            </button>
          </div>
        </div>
      </section>

      <section className="mission-step card card-pad section">
        <div className="step-title">Bước 1 · Chọn chương</div>

        <div className="chapter-picker chapter-picker-large">
          {CHAPTERS.map((c) => (
            <button
              key={c.key}
              type="button"
              disabled={!c.enabled}
              className={`chapter-option${chapter === c.key ? " selected" : ""}${!c.enabled ? " disabled" : ""}`}
              onClick={() => c.enabled && setChapter(c.key)}
            >
              <span className="chapter-main">{c.label}</span>
              <span className="chapter-sub">
                {c.enabled
                  ? "Kho demo · chọn để luyện"
                  : "Chưa có trong kho demo"}
              </span>
            </button>
          ))}
        </div>

        <div className="mission-note" style={{ marginTop: 10 }}>
          Bản rebuild đã có dữ liệu kiểm thử cho Chương 1 và Chương 2.
          Các chương còn lại hiển thị để bám cấu trúc web gốc và sẽ bật khi import kho câu hỏi.
        </div>
      </section>

      <section className="mission-step card card-pad section">
        <div className="step-title">Bước 2 · Chọn độ khó</div>

        <div className="difficulty-grid mission-difficulty-grid">
          {configs.map((c) => {
            const stars = "★".repeat(c.stars) + "☆".repeat(4 - c.stars);

            return (
              <button
                key={c.key}
                type="button"
                className={`difficulty-card mission-card${c.key === "high_application" ? " high" : ""}${difficulty === c.key ? " selected" : ""}`}
                onClick={() => setDifficulty(c.key)}
              >
                <div>
                  <div className="difficulty-stars">{stars}</div>
                  <div className="mission-card-title">{c.label}</div>
                  <div className="mission-card-subtitle">
                    {c.level} · {c.total} câu
                  </div>
                  <div className="mission-card-rewards">
                    <b>Mỗi câu đúng:</b> TN {c.points.single} · Đ/S {c.points.true_false} ·
                    {" "}TLN {c.points.short_answer} EXP · {c.goldPerCorrect} vàng
                  </div>
                  <div className="mission-card-range">
                    Cả lượt: {c.runExpMin}–{c.runExpMax} EXP · {c.runGold} vàng
                  </div>
                </div>
                <div className="mission-cap">
                  {c.dailyLabel}: 0/{c.dailyCap} đủ thưởng
                </div>
              </button>
            );
          })}
        </div>

        <div className="mission-note">
          Câu gặp lại ngày sau còn 50%. Lượt đúng dưới 50% hoặc làm quá nhanh
          (mỗi câu 5–25 giây, câu Đúng/Sai 30 giây) thì không thưởng.
        </div>
      </section>

      {error && (
        <div className="badge badge-red section" role="alert">
          {error}
        </div>
      )}

      <div className="mission-start-bar">
        <button
          className="mission-start-btn"
          type="button"
          onClick={start}
          disabled={loading}
        >
          {loading
            ? "Đang tạo lượt…"
            : `Bắt đầu · ${selected.label} · ${selected.total} câu`}
        </button>
      </div>
    </>
  );
}
