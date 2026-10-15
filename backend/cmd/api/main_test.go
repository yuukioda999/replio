package main

import (
 "net/http"
 "net/http/httptest"
 "testing"
)

func TestPortFromEnv(t *testing.T) {
 cases := []struct{name, value, want string; wantErr bool}{
  {"default", "", "8080", false},
  {"custom", "9090", "9090", false},
  {"zero", "0", "", true},
  {"negative", "-1", "", true},
  {"nonNumeric", "abc", "", true},
  {"tooLarge", "65536", "", true},
 }
 for _, tc := range cases {
  t.Run(tc.name, func(t *testing.T) {
   got, err := portFromEnv(func(string) string { return tc.value })
   if (err != nil) != tc.wantErr { t.Fatalf("error = %v, wantErr = %v", err, tc.wantErr) }
   if got != tc.want { t.Fatalf("port = %q, want %q", got, tc.want) }
  })
 }
}

func TestUnknownRouteReturnsNotFound(t *testing.T) {
 request := httptest.NewRequest(http.MethodGet, "/unknown", nil)
 response := httptest.NewRecorder()
 newHandler().ServeHTTP(response, request)
 if response.Code != http.StatusNotFound { t.Fatalf("status = %d, want 404", response.Code) }
}
