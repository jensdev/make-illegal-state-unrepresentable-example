// ============================================================================
// PARSE, DON'T VALIDATE
// ============================================================================
// This module is the ONLY place that uses type assertions (as Email, as User).
// The rest of the codebase relies on the types as proof — no re-checking needed.
//
import { Email, FetchError, Result, User } from "../types/user";

function parseEmail(raw: unknown): Result<Email, FetchError> {
  if (typeof raw !== "string" || !raw.includes("@")) {
    return {
      ok: false,
      error: { _tag: "ParseError", message: `Invalid email: ${String(raw)}` },
    };
  }
  return { ok: true, value: raw as Email };
}

export function parseUser(raw: unknown): Result<User, FetchError> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      ok: false,
      error: { _tag: "ParseError", message: "Expected an object" },
    };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.id !== "number") {
    return {
      ok: false,
      error: { _tag: "ParseError", message: "Missing or invalid field: id" },
    };
  }
  if (typeof obj.name !== "string") {
    return {
      ok: false,
      error: { _tag: "ParseError", message: "Missing or invalid field: name" },
    };
  }
  if (typeof obj.username !== "string") {
    return {
      ok: false,
      error: {
        _tag: "ParseError",
        message: "Missing or invalid field: username",
      },
    };
  }

  const emailResult = parseEmail(obj.email);
  if (!emailResult.ok) return emailResult;

  return {
    ok: true,
    value: { ...obj, email: emailResult.value } as User,
  };
}
