package handler

import (
 "encoding/json"
 "net"
 "net/http"
 "strconv"
 "sync"
 "time"
)

type visitor struct { count int; until time.Time }

type Guard struct {
 mu sync.Mutex
 visitors map[string]visitor
 window time.Duration
 maxRequests int
 slots chan struct{}
 enabled bool
}

func NewGuard(maxRequests int, window time.Duration, concurrency int, enabled bool) *Guard {
 return &Guard{visitors:make(map[string]visitor),window:window,maxRequests:maxRequests,slots:make(chan struct{},concurrency),enabled:enabled}
}

func (g *Guard) Wrap(next http.Handler) http.Handler {
 return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){
  // Only generation POST requests consume quota. Other methods keep their original HTTP semantics.
  if r.Method != http.MethodPost {next.ServeHTTP(w,r);return}
  w.Header().Set("Content-Type","application/json; charset=utf-8")
  if !g.enabled {writeGuardError(w,http.StatusServiceUnavailable,"generation_disabled");return}
  // RemoteAddr comes from the direct TCP peer. Forwarded headers are deliberately ignored.
  ip,_,err:=net.SplitHostPort(r.RemoteAddr)
  if err!=nil {writeGuardError(w,http.StatusBadRequest,"invalid_remote_address");return}
  now:=time.Now()
  g.mu.Lock()
  if len(g.visitors)>10000 {
   for k,v:=range g.visitors {if !now.Before(v.until){delete(g.visitors,k)}}
   if len(g.visitors)>10000 {g.mu.Unlock();writeGuardError(w,http.StatusServiceUnavailable,"rate_limiter_capacity");return}
  }
  v:=g.visitors[ip]
  if !now.Before(v.until) {v=visitor{until:now.Add(g.window)}}
  if v.count>=g.maxRequests {
   retry:=int(time.Until(v.until).Seconds())+1
   if retry<1 {retry=1}
   g.mu.Unlock()
   w.Header().Set("Retry-After",strconv.Itoa(retry))
   writeGuardError(w,http.StatusTooManyRequests,"rate_limited")
   return
  }
  v.count++
  g.visitors[ip]=v
  g.mu.Unlock()
  select {
  case g.slots<-struct{}{}:
   defer func(){<-g.slots}()
   next.ServeHTTP(w,r)
  default:
   writeGuardError(w,http.StatusServiceUnavailable,"generation_busy")
  }
 })
}

func writeGuardError(w http.ResponseWriter,status int,code string){
 w.WriteHeader(status)
 _=json.NewEncoder(w).Encode(map[string]string{"error":code})
}
