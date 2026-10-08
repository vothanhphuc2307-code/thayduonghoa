import type { PublicQuestion } from "./types";

export function serializeQuestion(row: any): PublicQuestion {
  return {
    id: Number(row.id),
    type: row.type,
    chapter: row.chapter,
    difficulty: row.difficulty,
    title: row.title,
    prompt: row.prompt,
    options: Array.isArray(row.options) ? row.options : [],
    true_false_items: Array.isArray(row.true_false_items) ? row.true_false_items : [],
  };
}
