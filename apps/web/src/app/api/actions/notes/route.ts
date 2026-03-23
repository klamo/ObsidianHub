import { NextResponse } from "next/server.js";

import { executeNoteActionRequest } from "../../../../server/note-actions";

export async function POST(request: Request) {
  const payloadResult = await readJsonPayload(request);
  if (!payloadResult.ok) {
    return NextResponse.json(payloadResult.body, { status: payloadResult.status });
  }

  const result = await executeNoteActionRequest(payloadResult.value);
  return NextResponse.json(result.body, { status: result.status });
}

async function readJsonPayload(request: Request) {
  const payload = await request.json().catch(() => undefined);
  if (payload === undefined) {
    return {
      ok: false,
      status: 400,
      body: {
        ok: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON.",
        },
      },
    } as const;
  }

  return {
    ok: true,
    value: payload,
  } as const;
}
