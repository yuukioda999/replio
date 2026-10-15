export type Channel = "email" | "slack" | "chat";
export type Tone = "polite" | "neutral" | "casual";
export type GenerateInput = { message: string; instruction: string; channel: Channel; tone: Tone };

export function validateInput(input: GenerateInput): string | null {
  if (!input.message.trim()) return "受信文を入力してください。";
  if (input.message.length > 12000) return "受信文は12,000文字以内で入力してください。";
  if (input.instruction.length > 2000) return "補足は2,000文字以内で入力してください。";
  if (!["email", "slack", "chat"].includes(input.channel)) return "返信する媒体を選択してください。";
  if (!["polite", "neutral", "casual"].includes(input.tone)) return "文章のトーンを選択してください。";
  return null;
}

export function parseReply(data: unknown): string {
  if (!data || typeof data !== "object" || !("reply" in data) || typeof data.reply !== "string" || !data.reply.trim()) {
    throw new Error("APIからの応答が不正です。");
  }
  return data.reply;
}

export async function generateReply(input: GenerateInput, signal?: AbortSignal): Promise<string> {
  const invalid = validateInput(input);
  if (invalid) throw new Error(invalid);
  let response: Response;
  try {
    response = await fetch("/api/v1/replies/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal,
      cache: "no-store",
    });
  } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.name === "AbortError")) {
      throw new Error("通信がタイムアウト、または中断されました。再試行してください。");
    }
    throw new Error("ネットワークに接続できません。接続状況を確認してください。");
  }
  if (!response.ok) {
    if (response.status === 429) throw new Error("利用が集中しています。しばらく待ってから再試行してください。");
    if (response.status === 503) throw new Error("生成機能は現在停止中、または混雑しています。");
    if (response.status === 400 || response.status === 413) throw new Error("入力内容を確認してください。");
    throw new Error("通信に失敗しました。時間をおいて再試行してください。");
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error("APIからの応答を読み取れませんでした。");
  }
  return parseReply(data);
}
