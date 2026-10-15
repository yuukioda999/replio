package main

import (
 "errors"
 "fmt"
 "log"
 "net/http"
 "os"
 "strconv"
 "time"
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
