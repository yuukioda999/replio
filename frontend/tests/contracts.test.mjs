import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const api = readFileSync(new URL("../src/lib/replies.ts", import.meta.url), "utf8");
const page = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const gateway = readFileSync(new URL("../src/app/api/v1/replies/generate/route.ts", import.meta.url), "utf8");
test("API contract and error statuses are represented", () => {
  for (const value of ["/api/v1/replies/generate", "POST", "429", "503", "message", "instruction", "channel", "tone"]) assert.ok(api.includes(value), value);
});
test("UI supports editing, copying and regenerating", () => {
  for (const value of ["setReply", "clipboard.writeText", "再生成", "role=\"alert\"", "生成しています"]) assert.ok(page.includes(value), value);
});
test("authenticated server-side gateway keeps API origin private", () => {
  assert.ok(gateway.includes("process.env.GO_API_ORIGIN"));
  assert.ok(gateway.includes("auth.auth.getUser"));
  assert.ok(gateway.includes("INTERNAL_API_SECRET"));
  assert.ok(!gateway.includes("NEXT_PUBLIC_GO_API_ORIGIN"));
});
