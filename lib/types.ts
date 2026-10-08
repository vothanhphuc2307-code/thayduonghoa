export type QuestionType = "single" | "multiple" | "true_false" | "short_answer";

export type PublicOption = { id: string; label: string; text: string };
export type TrueFalseItem = { id: string; text: string };

export type PublicQuestion = {
  id: number;
  type: QuestionType;
  chapter: string;
  difficulty: string;
  title: string;
  prompt: string;
  options: PublicOption[];
  true_false_items: TrueFalseItem[];
};

export type AnswerPayload = {
  selected_options?: string[];
  true_false_answers?: Record<string, boolean>;
  text_answer?: string;
};

export type AnswersPayload = Record<string, AnswerPayload>;
