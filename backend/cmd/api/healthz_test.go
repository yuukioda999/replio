package main

import (
 "net/http"
 "net/http/httptest"
 "testing"
)

func TestHealthzGET(t *testing.T) {
 r := httptest.NewRequest(http.MethodGet, "/healthz", nil)
 w := httptest.NewRecorder()
 newHandler().ServeHTTP(w, r)
 if w.Code != http.StatusOK { t.Fatalf("status = %d, want 200", w.Code) }
 if got := w.Header().Get("Content-Type"); got != "application/json; charset=utf-8" { t.Fatalf("Content-Type = %q", got) }
 if got := w.Body.String(); got != `{"status":"ok"}` { t.Fatalf("body = %q", got) }
}

func TestHealthzRejectsNonGET(t *testing.T) {
 for _, method := range []string{http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodHead} {
  t.Run(method, func(t *testing.T) {
   r := httptest.NewRequest(method, "/healthz", nil)
   w := httptest.NewRecorder()
   newHandler().ServeHTTP(w, r)
   if w.Code != http.StatusMethodNotAllowed { t.Fatalf("status = %d, want 405", w.Code) }
   if got := w.Header().Get("Allow"); got != "GET" { t.Fatalf("Allow = %q, want GET", got) }
  })
 }
}

func TestHealthzUnknownPath(t *testing.T) {
 r := httptest.NewRequest(http.MethodGet, "/not-found", nil)
 w := httptest.NewRecorder()
 newHandler().ServeHTTP(w, r)
 if w.Code != http.StatusNotFound { t.Fatalf("status = %d, want 404", w.Code) }
}
