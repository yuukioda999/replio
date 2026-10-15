package handler

import (
 "encoding/json"
 "errors"
 "io"
 "net/http"
 "strings"

 "github.com/yuukioda999/replio/backend/internal/application"
)

const maxBodyBytes = 16 * 1024

type ReplyHandler struct { Service application.Service }

func (h ReplyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
 w.Header().Set("Content-Type", "application/json; charset=utf-8")
 if r.Method != http.MethodPost {
  w.Header().Set("Allow", "POST")
  writeError(w, http.StatusMethodNotAllowed, "method_not_allowed")
  return
 }
 if ct := r.Header.Get("Content-Type"); !strings.EqualFold(strings.TrimSpace(strings.Split(ct, ";")[0]), "application/json") {
  writeError(w, http.StatusUnsupportedMediaType, "unsupported_media_type")
  return
 }
 r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
 var req application.GenerateRequest
 dec := json.NewDecoder(r.Body)
 dec.DisallowUnknownFields()
 if err := dec.Decode(&req); err != nil {
  var maxErr *http.MaxBytesError
  if errors.As(err, &maxErr) { writeError(w, http.StatusRequestEntityTooLarge, "request_too_large"); return }
  writeError(w, http.StatusBadRequest, "invalid_json"); return
 }
 var extra any
 if err := dec.Decode(&extra); err != io.EOF {
  var maxErr *http.MaxBytesError
  if errors.As(err, &maxErr) { writeError(w, http.StatusRequestEntityTooLarge, "request_too_large"); return }
  writeError(w, http.StatusBadRequest, "invalid_json"); return
 }
 reply, err := h.Service.Generate(r.Context(), req)
 if err != nil {
  if err.Error() == "message is required" || err.Error() == "invalid channel" || err.Error() == "invalid tone" {
   writeError(w, http.StatusBadRequest, "invalid_request"); return
  }
  writeError(w, http.StatusInternalServerError, "generation_failed"); return
 }
 w.WriteHeader(http.StatusOK)
 _ = json.NewEncoder(w).Encode(map[string]string{"reply":reply})
}

func writeError(w http.ResponseWriter, status int, code string) {
 w.WriteHeader(status)
 _ = json.NewEncoder(w).Encode(map[string]string{"error":code})
}
