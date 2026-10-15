export type Channel = "email" | "slack" | "chat";
export type Tone = "polite" | "neutral" | "casual";
export type GenerateInput = { message: string; instruction: string; channel: Channel; tone: Tone };
export function validateInput(input: GenerateInput): string | null {
  if (!input.message.trim()) return "受信文を入力してください。";
  return null;
}
export async function generateReply(input: GenerateInput, signal?: AbortSignal): Promise<string> {
  const response = await fetch("/api/v1/replies/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal, cache: "no-store" });
  if (!response.ok) {
    if (response.status === 429) throw new Error("利用が集中しています。しばらく待ってから再試行してください。");
    if (response.status === 503) throw new Error("生成機能は現在停止中、または混雑しています。");
    if (response.status === 400 || response.status === 413) throw new Error("入力内容を確認してください。");
    throw new Error("通信に失敗しました。時間をおいて再試行してください。");
  }
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("reply" in data) || typeof data.reply !== "string") throw new Error("APIからの応答が不正です。");
  return data.reply;
}
