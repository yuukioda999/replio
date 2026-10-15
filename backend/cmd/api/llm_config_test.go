package main

import (
 "testing"

 "github.com/yuukioda999/replio/backend/internal/infrastructure"
)

func TestLLMFromEnv(t *testing.T) {
 tests:=[]struct{name string;env map[string]string;wantErr bool;wantClaude bool}{
  {"default fake",nil,false,false},
  {"explicit fake",map[string]string{"LLM_PROVIDER":"fake"},false,false},
  {"missing key",map[string]string{"LLM_PROVIDER":"claude","CLAUDE_MODEL":"model"},true,false},
  {"missing model",map[string]string{"LLM_PROVIDER":"claude","ANTHROPIC_API_KEY":"key"},true,false},
  {"invalid tokens",map[string]string{"LLM_PROVIDER":"claude","ANTHROPIC_API_KEY":"key","CLAUDE_MODEL":"model","CLAUDE_MAX_TOKENS":"0"},true,false},
  {"valid claude",map[string]string{"LLM_PROVIDER":"claude","ANTHROPIC_API_KEY":"key","CLAUDE_MODEL":"model","CLAUDE_MAX_TOKENS":"256"},false,true},
  {"unknown",map[string]string{"LLM_PROVIDER":"unknown"},true,false},
 }
 for _,tc:=range tests {t.Run(tc.name,func(t *testing.T){
  llm,err:=llmFromEnv(func(k string)string{return tc.env[k]})
  if (err!=nil)!=tc.wantErr {t.Fatalf("err=%v wantErr=%v",err,tc.wantErr)}
  if err==nil {_,ok:=llm.(infrastructure.ClaudeLLM);if ok!=tc.wantClaude {t.Fatalf("claude=%v want=%v",ok,tc.wantClaude)}}
 })}
}
