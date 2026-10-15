import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const api = readFileSync(new URL("../src/lib/replies.ts", import.meta.url), "utf8");
const page = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
test("API contract and error statuses are represented", () => {
  for (const value of ["/api/v1/replies/generate", "POST", "429", "503", "message", "instruction", "channel", "tone"]) assert.ok(api.includes(value), value);
});
test("UI supports editing, copying and regenerating", () => {
  for (const value of ["setReply", "clipboard.writeText", "再生成", "role=\"alert\"", "生成しています"]) assert.ok(page.includes(value), value);
});
test("server-side proxy origin is configured", () => {
  assert.ok(config.includes("process.env.GO_API_ORIGIN"));
  assert.ok(!config.includes("NEXT_PUBLIC_GO_API_ORIGIN"));
});
