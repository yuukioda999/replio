import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/replies.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { validateInput, parseReply, generateReply } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
const valid = { message: "こんにちは", instruction: "", channel: "email", tone: "polite" };

test("validates required message and input lengths", () => {
  assert.match(validateInput({ ...valid, message: "  " }), /受信文/);
  assert.match(validateInput({ ...valid, message: "あ".repeat(12001) }), /12,000/);
  assert.match(validateInput({ ...valid, instruction: "あ".repeat(2001) }), /2,000/);
  assert.equal(validateInput({ ...valid, message: "あ".repeat(12000), instruction: "あ".repeat(2000) }), null);
});

test("rejects unsupported channel and tone", () => {
  assert.match(validateInput({ ...valid, channel: "unknown" }), /媒体/);
  assert.match(validateInput({ ...valid, tone: "unknown" }), /トーン/);
});

test("validates reply response shape", () => {
  assert.equal(parseReply({ reply: "承知しました。" }), "承知しました。");
  for (const value of [null, {}, { reply: 123 }, { reply: "  " }]) assert.throws(() => parseReply(value), /不正/);
});

test("rejects invalid inputs before fetching", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("fetch should not run"); };
  try { await assert.rejects(generateReply({ ...valid, message: "" }), /受信文/); }
  finally { globalThis.fetch = original; }
});

test("handles HTTP statuses, malformed JSON and network errors", async () => {
  const original = globalThis.fetch;
  try {
    for (const [status, message] of [[429, /制限されています/], [503, /停止中/], [400, /入力内容/], [500, /通信に失敗/]]) {
      globalThis.fetch = async () => ({ ok: false, status });
      await assert.rejects(generateReply(valid), message);
    }
    globalThis.fetch = async () => ({ ok: true, json: async () => { throw new SyntaxError("bad JSON"); } });
    await assert.rejects(generateReply(valid), /読み取れ/);
    globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
    await assert.rejects(generateReply(valid), /ネットワーク/);
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ reply: "了解です" }) });
    assert.equal(await generateReply(valid), "了解です");
  } finally { globalThis.fetch = original; }
});

test("explains local rate limit and uses Retry-After without retrying", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls++;
      return { ok: false, status: 429, headers: { get: () => "125" }, json: async () => ({ error: "rate_limited" }) };
    };
    await assert.rejects(generateReply(valid), /上限に達しました。約3分後/);
    assert.equal(calls, 1, "429 must not automatically retry");

    globalThis.fetch = async () => ({ ok: false, status: 429, headers: { get: () => "not-a-number" }, json: async () => ({ error: "rate_limited" }) });
    await assert.rejects(generateReply(valid), /上限に達しました。しばらく待って/);

    globalThis.fetch = async () => ({ ok: false, status: 429, headers: { get: () => "30" }, json: async () => ({ error: "upstream_rate_limited" }) });
    await assert.rejects(generateReply(valid), /リクエストが制限されています/);

    globalThis.fetch = async () => ({ ok: false, status: 429, json: async () => { throw new Error("bad JSON"); } });
    await assert.rejects(generateReply(valid), /リクエストが制限されています/);
  } finally { globalThis.fetch = original; }
});
