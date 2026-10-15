package handler

import (
 "net/http"
 "net/http/httptest"
 "strings"
 "testing"
 "time"
)

func TestGuardRateLimitAndForwardedHeader(t *testing.T) {
 g:=NewGuard(1,time.Minute,1,true)
 next:=http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){w.WriteHeader(200)})
 send:=func(forward string)*httptest.ResponseRecorder{
  r:=httptest.NewRequest("POST","/api/v1/replies/generate",strings.NewReader("{}"))
  r.RemoteAddr="192.0.2.1:1234"
  r.Header.Set("X-Forwarded-For",forward)
  w:=httptest.NewRecorder()
  g.Wrap(next).ServeHTTP(w,r)
  return w
 }
 if got:=send("203.0.113.1");got.Code!=200 {t.Fatalf("first=%d",got.Code)}
 got:=send("203.0.113.2")
 if got.Code!=429 || got.Header().Get("Retry-After")=="" {t.Fatalf("second=%d header=%q",got.Code,got.Header().Get("Retry-After"))}
}
func TestGuardDisabled(t *testing.T){
 g:=NewGuard(1,time.Minute,1,false)
 r:=httptest.NewRequest("POST","/",nil)
 w:=httptest.NewRecorder()
 g.Wrap(http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){w.WriteHeader(200)})).ServeHTTP(w,r)
 if w.Code!=503 {t.Fatalf("status=%d",w.Code)}
}
func TestGuardConcurrent(t *testing.T){
 g:=NewGuard(5,time.Minute,1,true)
 entered:=make(chan struct{})
 release:=make(chan struct{})
 next:=http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){close(entered);<-release;w.WriteHeader(200)})
 done:=make(chan struct{})
 go func(){defer close(done);g.Wrap(next).ServeHTTP(httptest.NewRecorder(),httptest.NewRequest("POST","/",nil))}()
 <-entered
 w:=httptest.NewRecorder()
 g.Wrap(next).ServeHTTP(w,httptest.NewRequest("POST","/",nil))
 if w.Code!=503 {t.Fatalf("busy status=%d",w.Code)}
 close(release)
 <-done
}
