package main

import (
 "errors"
 "fmt"
 "log"
 "net/http"
 "os"
 "strconv"
 "time"

 "github.com/yuukioda999/replio/backend/internal/application"
 "github.com/yuukioda999/replio/backend/internal/handler"
 "github.com/yuukioda999/replio/backend/internal/infrastructure"
)

func portFromEnv(getenv func(string) string) (string, error) {
 p := getenv("PORT")
 if p == "" { return "8080", nil }
 n, err := strconv.Atoi(p)
 if err != nil || n < 1 || n > 65535 { return "", errors.New("PORT must be an integer from 1 to 65535") }
 return strconv.Itoa(n), nil
}

func newHandler() http.Handler {
 mux := http.NewServeMux()
 mux.Handle("/api/v1/replies/generate", handler.ReplyHandler{Service: application.Service{LLM: infrastructure.FakeLLM{}}})
 mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
  if r.Method != http.MethodGet {
   w.Header().Set("Allow", "GET")
   http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
   return
  }
  w.Header().Set("Content-Type", "application/json; charset=utf-8")
  w.WriteHeader(http.StatusOK)
  _, _ = w.Write([]byte(`{"status":"ok"}`))
 })
 mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
  http.NotFound(w, r)
 })
 return mux
}

func main() {
 port, err := portFromEnv(os.Getenv)
 if err != nil { log.Fatal(err) }
 server := &http.Server{
  Addr: ":" + port,
  Handler: newHandler(),
  ReadHeaderTimeout: 5 * time.Second,
 }
 log.Printf("Replio API listening on :%s", port)
 if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
  log.Fatal(fmt.Errorf("serve HTTP: %w", err))
 }
}
