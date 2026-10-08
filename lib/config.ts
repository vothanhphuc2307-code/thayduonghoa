export const DIFFICULTIES = {
  basic: {
    key: "basic",
    label: "Dễ",
    level: "Nhận biết",
    description: "Nhận biết · 10 câu",
    total: 10,
    dailyCap: 20,
    points: { single: 2, multiple: 2, true_false: 4, short_answer: 3 },
    goldPerCorrect: 1,
    dailyLabel: "Câu Nhận biết hôm nay",
    stars: 1,
    runExpMin: 20,
    runExpMax: 40,
    runGold: 10,
  },
  medium: {
    key: "medium",
    label: "Trung bình",
    level: "Thông hiểu",
    description: "Thông hiểu · 10 câu",
    total: 10,
    dailyCap: 20,
    points: { single: 3, multiple: 3, true_false: 6, short_answer: 4 },
    goldPerCorrect: 2,
    dailyLabel: "Câu Thông hiểu hôm nay",
    stars: 2,
    runExpMin: 30,
    runExpMax: 60,
    runGold: 20,
  },
  hard: {
    key: "hard",
    label: "Khó",
    level: "Vận dụng",
    description: "Vận dụng · 8 câu",
    total: 8,
    dailyCap: 50,
    points: { single: 5, multiple: 5, true_false: 10, short_answer: 6 },
    goldPerCorrect: 4,
    dailyLabel: "Câu Vận dụng hôm nay",
    stars: 3,
    runExpMin: 40,
    runExpMax: 80,
    runGold: 32,
  },
  high_application: {
    key: "high_application",
    label: "Siêu khó",
    level: "Vận dụng cao",
    description: "Vận dụng cao · 5 câu",
    total: 5,
    dailyCap: 30,
    points: { single: 8, multiple: 8, true_false: 15, short_answer: 20 },
    goldPerCorrect: 8,
    dailyLabel: "Câu Vận dụng cao hôm nay",
    stars: 4,
    runExpMin: 40,
    runExpMax: 100,
    runGold: 40,
  },
} as const;

export type DifficultyKey = keyof typeof DIFFICULTIES;

export const CHAPTERS = [
  { key: "c12-1", label: "Chương 1 · Ester – Lipid", group: "Lớp 12", enabled: true },
  { key: "c12-2", label: "Chương 2 · Carbohydrate", group: "Lớp 12", enabled: true },
  { key: "c12-3", label: "Chương 3 · Hợp chất chứa nitrogen", group: "Lớp 12", enabled: false },
  { key: "c12-4", label: "Chương 4 · Polymer", group: "Lớp 12", enabled: false },
  { key: "c12-5", label: "Chương 5 · Pin điện và điện phân", group: "Lớp 12", enabled: false },
  { key: "c12-6", label: "Chương 6 · Đại cương về kim loại", group: "Lớp 12", enabled: false },
  { key: "c12-7", label: "Chương 7 · Nguyên tố nhóm IA và nhóm IIA", group: "Lớp 12", enabled: false },
  { key: "c12-8", label: "Chương 8 · Sơ lược về kim loại chuyển tiếp dãy thứ nhất và phức chất", group: "Lớp 12", enabled: false },
  { key: "g12", label: "Trộn cả khối 12", group: "Lớp 12", enabled: false },
] as const;

export function difficultyConfig(key: string) {
  return DIFFICULTIES[key as DifficultyKey] ?? DIFFICULTIES.high_application;
}

export function chapterLabel(key: string) {
  return CHAPTERS.find((x) => x.key === key)?.label ?? key;
}

export function levelFromExp(exp: number) {
  let level = 1;
  let next = 155;
  let remaining = Math.max(0, exp);
  while (remaining >= next && level < 100) {
    remaining -= next;
    level += 1;
    next = 150 + level * 5;
  }
  return { level, inLevelExp: remaining, nextThreshold: next };
}
