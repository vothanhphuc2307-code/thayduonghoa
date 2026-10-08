export function json<T = unknown>(value: T, init?: ResponseInit) {
  return new Response(JSON.stringify(value), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {})
    }
  });
}

export function parseJsonBody<T>(body: unknown): T {
  if (!body || typeof body !== "object") throw new Error("Invalid JSON body");
  return body as T;
}

export function toId(value: string | undefined) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n <= 0) throw new Error("Invalid id");
  return n;
}
