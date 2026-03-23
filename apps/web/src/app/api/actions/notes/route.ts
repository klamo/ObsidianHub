import { NextResponse } from "next/server";

import { executeNoteActionRequest } from "../../../../server/note-actions";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const result = await executeNoteActionRequest(payload);

  return NextResponse.json(result.body, { status: result.status });
}
