import { NextResponse } from "next/server";

export function ok<T>(data: T) {
  return NextResponse.json({ ok: true, data });
}

export function created<T>(data: T) {
  return NextResponse.json({ ok: true, data }, { status: 201 });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}