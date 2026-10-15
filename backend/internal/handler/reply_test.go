package handler

import (
 "net/http"
 "net/http/httptest"
 "strings"
 "testing"

 "github.com/yuukioda999/replio/backend/internal/application"
 "github.com/yuukioda999/replio/backend/internal/infrastructure"
)

func TestReplyHandler(t *testing.T) {
 h:=ReplyHandler{Service:application.Service{LLM:infrastructure.FakeLLM{}}}
 cases:=[]struct{name,method,ct,body string;status int}{
  {"ok","POST","application/json",`{"message":"こんにちは","channel":"email","tone":"polite"}`,200},
  {"invalid message","POST","application/json",`{"message":" ","channel":"email","tone":"polite"}`,400},
  {"invalid channel","POST","application/json",`{"message":"hi","channel":"invalid","tone":"polite"}`,400},
  {"malformed","POST","application/json","{",400},
  {"unknown field","POST","application/json",`{"message":"hi","channel":"chat","tone":"neutral","other":1}`,400},
  {"wrong content type","POST","text/plain","hi",415},
  {"wrong method","GET","application/json","",405},
  {"too large","POST","application/json",strings.Repeat("x",17000),413},
 }
 for _,tc:=range cases {t.Run(tc.name,func(t *testing.T){
  req:=httptest.NewRequest(tc.method,"/api/v1/replies/generate",strings.NewReader(tc.body))
  req.Header.Set("Content-Type",tc.ct)
  w:=httptest.NewRecorder()
  h.ServeHTTP(w,req)
  if w.Code!=tc.status {t.Fatalf("status %d, want %d; body=%s",w.Code,tc.status,w.Body.String())}
  if tc.status==200 && !strings.Contains(w.Body.String(),`"reply"`) {t.Fatalf("missing reply: %s",w.Body.String())}
  if tc.status==405 && w.Header().Get("Allow")!="POST" {t.Fatal("missing Allow header")}
 })}
}
