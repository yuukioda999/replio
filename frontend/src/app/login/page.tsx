"use client";
import { useEffect, useState } from "react";
import { getAuthClient } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const auth = getAuthClient();
  useEffect(() => {
    if (!auth) return;
    void auth.auth.getSession().then(({ data }) => { if (data.session) window.location.replace("/"); });
  }, [auth]);
  async function magicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!auth || busy) return;
    setBusy(true); setNotice("");
    try {
      const { error } = await auth.auth.signInWithOtp({
        email, options: { emailRedirectTo: window.location.origin + "/" }
      });
      setNotice(error ? "メールを送信できませんでした。設定を確認してください。" : "ログイン用リンクをメールで送信しました。");
    } catch { setNotice("通信に失敗しました。時間をおいてお試しください。"); }
    finally { setBusy(false); }
  }
  async function google() {
    if (!auth || busy) return;
    setBusy(true); setNotice("");
    const { error } = await auth.auth.signInWithOAuth({
      provider: "google", options: { redirectTo: window.location.origin + "/" }
    });
    if (error) { setNotice("Googleログインを開始できませんでした。"); setBusy(false); }
  }
  return <main style={{maxWidth:420,margin:"12vh auto",padding:24}}>
    <a href="/">← Replio</a>
    <h1>ログイン</h1>
    <p>Googleアカウント、またはメールのリンクでログインできます。</p>
    {!auth ? <p role="alert">認証機能は未設定です。Supabaseの環境変数を設定してください。</p> :
    <>
      <button type="button" onClick={google} disabled={busy}>Googleでログイン</button>
      <p>または</p>
      <form onSubmit={magicLink}>
        <label htmlFor="login-email">メールアドレス</label>
        <input id="login-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} style={{display:"block",width:"100%",padding:12,margin:"8px 0"}}/>
        <button type="submit" disabled={busy}>{busy?"送信中…":"ログインリンクを送信"}</button>
      </form>
    </>}
    {notice && <p role="status">{notice}</p>}
  </main>;
}
