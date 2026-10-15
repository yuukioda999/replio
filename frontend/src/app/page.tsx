"use client";
import { useRef, useState } from "react";
import { generateReply, validateInput, type Channel, type Tone } from "@/lib/replies";

export default function Home() {
  const [message, setMessage] = useState("");
  const [instruction, setInstruction] = useState("");
  const [channel, setChannel] = useState<Channel>("email");
  const [tone, setTone] = useState<Tone>("polite");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const controller = useRef<AbortController | null>(null);

  async function generate() {
    const input = { message, instruction, channel, tone };
    const invalid = validateInput(input);
    if (invalid) { setError(invalid); return; }
    if (busy) return;
    setError(""); setCopied(false); setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    const timeout = setTimeout(() => abort.abort(), 25000);
    try { setReply(await generateReply(input, abort.signal)); }
    catch (e) { setError(abort.signal.aborted ? "通信がタイムアウトしました。再試行してください。" : e instanceof Error ? e.message : "生成に失敗しました。"); }
    finally { clearTimeout(timeout); controller.current = null; setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(reply); setCopied(true); setError(""); }
    catch { setError("コピーできませんでした。手動で選択してコピーしてください。"); }
  }
  return <main className="container">
    <header><span className="brand">Replio</span><span className="tag">返信文ジェネレーター</span></header>
    <section className="intro"><h1>返信に悩む時間を、もっと短く。</h1><p>受信した文章と伝えたい内容を入力して、返信の下書きを作成します。</p></section>
    <div className="workspace">
      <section className="panel"><h2>返信内容を入力</h2>
        <label htmlFor="message">受信した文章 <span className="required">必須</span></label>
        <textarea id="message" rows={7} value={message} onChange={e => setMessage(e.target.value)} placeholder="相手から届いたメールやチャットを貼り付けてください" maxLength={12000} />
        <label htmlFor="instruction">返信の意図・補足指示 <span className="optional">任意</span></label>
        <textarea id="instruction" rows={3} value={instruction} onChange={e => setInstruction(e.target.value)} placeholder="例：対応可能か確認してから回答したい" maxLength={2000} />
        <div className="choices"><div><label htmlFor="channel">媒体</label><select id="channel" value={channel} onChange={e => setChannel(e.target.value as Channel)}><option value="email">メール</option><option value="slack">Slack</option><option value="chat">ビジネスチャット</option></select></div>
        <div><label htmlFor="tone">文体</label><select id="tone" value={tone} onChange={e => setTone(e.target.value as Tone)}><option value="polite">丁寧</option><option value="neutral">標準</option><option value="casual">親しみやすい</option></select></div></div>
        <button className="primary" type="button" onClick={generate} disabled={busy}>{busy ? "生成中…" : reply ? "返信文を再生成" : "返信文を生成"}</button>
        {error && <p role="alert" className="error">{error}</p>}
      </section>
      <section className="panel"><div className="resultHeading"><h2>生成された返信文</h2>{reply && <button type="button" onClick={copy}>{copied ? "コピーしました" : "コピー"}</button>}</div>
        {reply ? <><label htmlFor="reply">内容を編集できます</label><textarea id="reply" rows={13} value={reply} onChange={e => { setReply(e.target.value); setCopied(false); }} /></> : <div className="empty" aria-live="polite">{busy ? "返信文を作成しています…" : "生成した返信文がここに表示されます。"}</div>}
        <p className="notice">生成文は下書きです。納期・金額・対応可否などを確認してから送信してください。</p>
      </section>
    </div>
    <footer>Replio — AI-assisted reply drafting</footer>
  </main>;
}
