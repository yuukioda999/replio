package infrastructure

import (
 "context"
 "net/http"
 "net/http/httptest"
 "strings"
 "testing"
 "time"
)

func TestClaudeSuccess(t *testing.T) {
 server:=httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){
  if r.Method!="POST" || r.Header.Get("x-api-key")!="test-key" || r.Header.Get("anthropic-version")!="2023-06-01" {t.Error("invalid request")}
  w.Header().Set("Content-Type","application/json")
  _,_=w.Write([]byte(`{"content":[{"type":"text","text":"返信案"}]}`))
 }))
 defer server.Close()
 c:=ClaudeLLM{Client:server.Client(),APIKey:"test-key",Model:"test-model",Endpoint:server.URL,MaxTokens:256}
 got,err:=c.Generate(context.Background(),"hello")
 if err!=nil || got!="返信案" {t.Fatalf("got %q err %v",got,err)}
}
func TestClaudeFailures(t *testing.T) {
 for _,tc:=range []struct{name string;status int;body string}{
  {"api error",429,`{"error":"rate limit"}`},
  {"invalid json",200,"{"},
  {"empty",200,`{"content":[]}`},
 }{
  t.Run(tc.name,func(t *testing.T){
   server:=httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){w.WriteHeader(tc.status);_,_=w.Write([]byte(tc.body))}))
   defer server.Close()
   c:=ClaudeLLM{Client:server.Client(),APIKey:"key",Model:"model",Endpoint:server.URL,MaxTokens:256}
   _,err:=c.Generate(context.Background(),"test")
   if err==nil {t.Fatal("expected error")}
   if strings.Contains(err.Error(),"rate limit") {t.Fatal("leaked upstream response")}
  })
 }
}
func TestClaudeTimeout(t *testing.T) {
 server:=httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){time.Sleep(100*time.Millisecond);w.WriteHeader(http.StatusOK)}))
 defer server.Close()
 c:=ClaudeLLM{Client:&http.Client{Timeout:20*time.Millisecond},APIKey:"key",Model:"model",Endpoint:server.URL,MaxTokens:256}
 _,err:=c.Generate(context.Background(),"test")
 if err==nil {t.Fatal("expected timeout")}
}
