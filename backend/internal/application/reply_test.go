package application

import (
 "context"
 "errors"
 "strings"
 "testing"
)

type spyLLM struct { prompt string }
func (s *spyLLM) Generate(_ context.Context, p string) (string,error) { s.prompt=p; return "draft",nil }
type failedLLM struct{}
func (failedLLM) Generate(context.Context,string)(string,error){return "",errors.New("failure")}

func TestGenerate(t *testing.T) {
 spy:=&spyLLM{}
 req:=GenerateRequest{Message:"納期は？",Instruction:"確認中",Channel:"email",Tone:"polite"}
 got,err:=(Service{LLM:spy}).Generate(context.Background(),req)
 if err!=nil || got!="draft" { t.Fatalf("got %q, %v",got,err) }
 for _,word:=range []string{"納期は？","確認中","確約しない","email","polite"} {
  if !strings.Contains(spy.prompt,word) {t.Fatalf("prompt missing %q",word)}
 }
}
func TestInvalidRequest(t *testing.T) {
 for _,req:=range []GenerateRequest{
  {Message:" ",Channel:"email",Tone:"polite"},
  {Message:"hello",Channel:"wrong",Tone:"polite"},
  {Message:"hello",Channel:"email",Tone:"wrong"},
 } {
  if _,err:=(Service{LLM:&spyLLM{}}).Generate(context.Background(),req);err==nil {t.Fatalf("accepted %+v",req)}
 }
}
func TestLLMFailure(t *testing.T) {
 _,err:=(Service{LLM:failedLLM{}}).Generate(context.Background(),GenerateRequest{Message:"hello",Channel:"chat",Tone:"neutral"})
 if err==nil {t.Fatal("expected error")}
}
