import { difficultyConfig } from "./config";
import type { AnswerPayload, AnswersPayload, QuestionType } from "./types";

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/,/g, ".")
    .replace(/\s+/g, " ");
}

function sameSet(a: string[], b: string[]) {
  const aa = [...new Set(a.map(String))].sort();
  const bb = [...new Set(b.map(String))].sort();
  return aa.length === bb.length && aa.every((x, i) => x === bb[i]);
}

type DbQuestion = {
  id: number;
  type: QuestionType;
  correct_options: unknown;
  correct_true_false: unknown;
  accepted_texts: unknown;
  explanation: string;
};

function questionCorrect(question: DbQuestion, answer: AnswerPayload | undefined) {
  if (!answer) return false;

  if (question.type === "single" || question.type === "multiple") {
    const expected = Array.isArray(question.correct_options)
      ? question.correct_options.map(String)
      : [];
    return sameSet(answer.selected_options ?? [], expected);
  }

  if (question.type === "true_false") {
    const expected = (question.correct_true_false && typeof question.correct_true_false === "object")
      ? question.correct_true_false as Record<string, boolean>
      : {};
    const actual = answer.true_false_answers ?? {};
    const keys = Object.keys(expected);
    return keys.length === Object.keys(actual).length && keys.every((k) => actual[k] === expected[k]);
  }

  const accepted = Array.isArray(question.accepted_texts)
    ? question.accepted_texts.map(normalizeText)
    : [];
  return accepted.includes(normalizeText(answer.text_answer));
}

export function scoreRun(
  questions: DbQuestion[],
  answers: AnswersPayload,
  difficulty: string
) {
  const config = difficultyConfig(difficulty);
  const details = questions.map((question) => {
    const correct = questionCorrect(question, answers[String(question.id)]);
    const exp = correct ? config.points[question.type] : 0;
    const gold = correct ? config.goldPerCorrect : 0;
    return {
      questionId: question.id,
      type: question.type,
      correct,
      exp,
      gold,
      explanation: question.explanation
    };
  });

  return {
    correctCount: details.filter((x) => x.correct).length,
    total: questions.length,
    expReward: details.reduce((s, x) => s + x.exp, 0),
    goldReward: details.reduce((s, x) => s + x.gold, 0),
    details
  };
}
