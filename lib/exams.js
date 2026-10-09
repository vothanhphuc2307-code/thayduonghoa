export function publicQuestion(question, includeExplanation = false) {
  return {
    id: question.id,
    sortOrder: question.sort_order,
    prompt: question.prompt,
    type: question.question_type,
    points: Number(question.points),
    options: (Array.isArray(question.options) ? question.options : []).map((option) => ({
      id: String(option.id),
      label: String(option.label ?? option.id),
      text: String(option.text ?? '')
    })),
    ...(includeExplanation ? { explanation: question.explanation || '' } : {})
  };
}

export function normalizedText(value) {
  return String(value ?? '').normalize('NFKC').trim().toLocaleLowerCase('vi').replace(/\s+/g, ' ');
}

function normalizedChoice(value) {
  const values = Array.isArray(value) ? value : value == null || value === '' ? [] : [value];
  return [...new Set(values.map(v => String(v).trim()).filter(Boolean))].sort();
}

export function gradeQuestion(question, given) {
  if (question.question_type === 'short_answer') {
    const accepted = Array.isArray(question.accepted_answers) ? question.accepted_answers : [];
    const entered = normalizedText(typeof given === 'object' && given !== null ? given.text : given);
    const correct = accepted.some(value => normalizedText(value) === entered);
    return { correct, earned: correct ? Number(question.points) : 0 };
  }
  const correctValues = Array.isArray(question.answer_key) ? question.answer_key : [];
  const selected = normalizedChoice(typeof given === 'object' && given !== null && 'selected' in given ? given.selected : given);
  const target = normalizedChoice(correctValues);
  const correct = selected.length === target.length && selected.every((v, i) => v === target[i]);
  return { correct, earned: correct ? Number(question.points) : 0 };
}
