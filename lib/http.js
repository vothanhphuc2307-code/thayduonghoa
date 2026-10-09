import { NextResponse } from 'next/server';

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function safeString(value, max = 5000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}
