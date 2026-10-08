export const DIFFICULTIES = {
  basic: {
    key: "basic",
    label: "Cơ bản",
    level: "Cơ bản",
    description: "Làm quen kiến thức, câu hỏi ngắn và rõ.",
    total: 5,
    dailyCap: null,
    points: { single: 4, multiple: 4, true_false: 7, short_answer: 10 },
    goldPerCorrect: 4
  },
  medium: {
    key: "medium",
    label: "Trung bình",
    level: "Trung bình",
    description: "Tăng độ phân tích và liên kết kiến thức.",
    total: 5,
    dailyCap: null,
    points: { single: 6, multiple: 6, true_false: 10, short_answer: 15 },
    goldPerCorrect: 6
  },
  high_application: {
    key: "high_application",
    label: "Siêu khó",
    level: "Siêu khó",
    description: "Vận dụng cao · 5 câu",
    total: 5,
    dailyCap: 30,
    points: { single: 8, multiple: 8, true_false: 15, short_answer: 20 },
    goldPerCorrect: 8
  }
} as const;

export type DifficultyKey = keyof typeof DIFFICULTIES;

export const CHAPTERS = [
  { key: "c12-1", label: "Chương 1 · Ester – Lipid" },
  { key: "c12-2", label: "Chương 2 · Carbohydrate" }
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
  while (remaining >= next && level < 99) {
    remaining -= next;
    level += 1;
    next = 150 + level * 5;
  }
  return { level, inLevelExp: remaining, nextThreshold: next };
}
