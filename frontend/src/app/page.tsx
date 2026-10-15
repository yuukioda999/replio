"use client";
import { useState } from "react";
import { generateReply, validateInput, type Channel, type Tone } from "@/lib/replies";

const channels: { value: Channel; label: string }[] = [{value:"email",label:"メール"},{value:"slack",label:"Slack"},{value:"chat",label:"チャット"}];
const tones: { value: Tone; label: string }[] = [{value:"polite",label:"丁寧"},{value:"neutral",label:"標準"},{value:"casual",label:"親しみやすい"}];
const sample = "お世話になっております。来週金曜日までにシステムの修正をご対応いただくことは可能でしょうか？ご確認よろしくお願いいたします。";
export default function Home() {
  const [message,setMessage]=useState("");
  const [instruction,setInstruction]=useState("");
  const [channel,setChannel]=useState<Channel>("email");
  const [tone,setTone]=useState<Tone>("polite");
  const [reply,setReply]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [copied,setCopied]=useState(false);
  const [generated,setGenerated]=useState(false);
  async function generate() {
    const input={message,instruction,channel,tone};
    const invalid=validateInput(input);
    if(invalid){setError(invalid);document.getElementById("message")?.focus();return;}
    if(busy)return;
    setError("");setCopied(false);setBusy(true);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),25000);
    try{setReply(await generateReply(input,controller.signal));setGenerated(true);}
    catch(e){setError(controller.signal.aborted?"通信がタイムアウトしました。再試行してください。":e instanceof Error?e.message:"生成に失敗しました。");}
    finally{clearTimeout(timeout);setBusy(false);}
  }
  async function copy(){
    try{await navigator.clipboard.writeText(reply);setCopied(true);setError("");}
    catch{setError("コピーできませんでした。文章を選択してコピーしてください。");}
  }
  return <div className="app-shell">
    <header className="topbar"><div className="topbar-inner"><a className="wordmark" href="/" aria-label="Replio ホーム"><span className="logo-symbol">R<span>.</span></span><span>replio</span></a><span className="top-divider"/><span className="top-label">返信文ジェネレーター</span><span className="top-spacer"/><span className="status"><span className="status-dot"/>ワークスペース</span></div></header>
    <main className="main">
      <div className="heading"><div className="eyebrow"><span className="eyebrow-line"/> YOUR WRITING ASSISTANT</div><h1>返信を、もっとスマートに。</h1><p>受信したメッセージを貼り付けるだけ。伝えたいことに合わせた返信の下書きを作成します。</p></div>
      <div className="editor-grid">
        <section className="surface input-panel" aria-labelledby="input-title">
          <div className="surface-head"><div className="section-index">01</div><div><h2 id="input-title">メッセージを入力</h2><p>相手から届いた文章と返信の条件を設定</p></div></div>
          <div className="form-content">
            <div className="field-heading"><label htmlFor="message">受信したメッセージ <span className="required">必須</span></label><button type="button" className="text-action" onClick={()=>{setMessage(sample);setInstruction("対応可能か社内で確認してから回答したい。");setError("");}}>サンプルを入力 <span aria-hidden="true">↗</span></button></div>
            <textarea id="message" className="message-field" rows={7} maxLength={12000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="ここに受信したメールやチャットの文章を貼り付けてください…" aria-invalid={!!error&&!message.trim()}/>
            <div className="field-foot"><span>メール・Slack・チャットに対応</span><span>{message.length.toLocaleString()} / 12,000</span></div>
            <div className="field-group"><label htmlFor="instruction">返信の意図・補足 <span className="optional">任意</span></label><textarea id="instruction" rows={3} maxLength={2000} value={instruction} onChange={e=>setInstruction(e.target.value)} placeholder="例：まだ確約せず、確認後に改めて連絡したい"/></div>
            <div className="control-group"><span className="control-label" id="channel-label">返信する媒体</span><div className="segmented" role="group" aria-labelledby="channel-label">{channels.map(c=><button key={c.value} type="button" className={channel===c.value?"segment active":"segment"} aria-pressed={channel===c.value} onClick={()=>setChannel(c.value)}>{c.label}</button>)}</div></div>
            <div className="control-group"><span className="control-label" id="tone-label">文章のトーン</span><div className="segmented" role="group" aria-labelledby="tone-label">{tones.map(t=><button key={t.value} type="button" className={tone===t.value?"segment active":"segment"} aria-pressed={tone===t.value} onClick={()=>setTone(t.value)}>{t.label}</button>)}</div></div>
            <button className="generate-button" type="button" disabled={busy} onClick={generate}>{busy?<><span className="spinner" aria-hidden="true"/>生成しています…</>:<><span aria-hidden="true">✦</span>{generated?"返信文を再生成":"返信文を生成"}<span className="button-arrow" aria-hidden="true">→</span></>}</button>
            {error&&<div role="alert" className="error-box"><span aria-hidden="true">!</span>{error}<button type="button" onClick={()=>setError("")} aria-label="エラーを閉じる">×</button></div>}
          </div>
        </section>
        <section className="surface output-panel" aria-labelledby="output-title">
          <div className="surface-head"><div className="section-index">02</div><div><h2 id="output-title">生成された返信文</h2><p>文章を確認・編集してコピー</p></div>{reply&&<span className="ready-tag">生成済み</span>}</div>
          <div className="output-body" aria-live="polite">{reply?<><div className="output-toolbar"><span><span className="edit-indicator"/>編集可能</span><button type="button" className="copy-button" onClick={copy} disabled={!reply}>{copied?"✓ コピーしました":"▢ コピーする"}</button></div><label htmlFor="reply" className="sr-only">生成された返信文を編集</label><textarea id="reply" className="reply-field" rows={14} value={reply} onChange={e=>{setReply(e.target.value);setCopied(false);}}/></>:<div className="empty-state"><div className="empty-graphic" aria-hidden="true"><div className="paper"><span/><span/><span/></div><span className="sparkle">✦</span></div><h3>{busy?"返信文を作成中…":"返信文がここに表示されます"}</h3><p>{busy?"少々お待ちください。":"左側に文章を入力し「返信文を生成」を押してください。"}</p></div>}</div>
          <div className="output-note"><span className="note-icon" aria-hidden="true">ⓘ</span><p>生成結果は下書きです。送信前に納期・金額・対応可否などの内容をご確認ください。</p></div>
        </section>
      </div>
      <div className="bottom-hint"><span>✦</span> 伝えたいことを補足すると、より意図に沿った返信を作成できます。</div>
    </main>
    <footer className="footer"><span>© 2026 Replio</span><span>Thoughtful replies, made simple.</span></footer>
  </div>;
}
