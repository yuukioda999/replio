package infrastructure

import (
 "bytes"
 "context"
 "encoding/json"
 "errors"
 "fmt"
 "io"
 "net/http"
 "strings"
)

const defaultClaudeEndpoint = "https://api.anthropic.com/v1/messages"

type ClaudeLLM struct {
 Client *http.Client
 APIKey string
 Model string
 Endpoint string
 MaxTokens int
}

func (c ClaudeLLM) Generate(ctx context.Context, prompt string) (string, error) {
 if c.APIKey == "" || c.Model == "" || c.MaxTokens <= 0 || c.Client == nil { return "", errors.New("invalid Claude configuration") }
 endpoint := c.Endpoint
 if endpoint == "" { endpoint = defaultClaudeEndpoint }
 payload := struct {
  Model string `json:"model"`
  MaxTokens int `json:"max_tokens"`
  Messages []struct{Role string `json:"role"`; Content string `json:"content"`} `json:"messages"`
 }{Model:c.Model,MaxTokens:c.MaxTokens}
 payload.Messages=append(payload.Messages,struct{Role string `json:"role"`; Content string `json:"content"`}{Role:"user",Content:prompt})
 body,err:=json.Marshal(payload)
 if err!=nil {return "",fmt.Errorf("marshal Claude request: %w",err)}
 req,err:=http.NewRequestWithContext(ctx,http.MethodPost,endpoint,bytes.NewReader(body))
 if err!=nil {return "",fmt.Errorf("build Claude request: %w",err)}
 req.Header.Set("Content-Type","application/json")
 req.Header.Set("x-api-key",c.APIKey)
 req.Header.Set("anthropic-version","2023-06-01")
 resp,err:=c.Client.Do(req)
 if err!=nil {return "",fmt.Errorf("Claude request failed: %w",err)}
 defer resp.Body.Close()
 if resp.StatusCode != http.StatusOK {return "",errors.New("Claude API returned unsuccessful status")}
 limited:=io.LimitReader(resp.Body,1<<20)
 var out struct {
  Content []struct{Type string `json:"type"`; Text string `json:"text"`} `json:"content"`
 }
 if err:=json.NewDecoder(limited).Decode(&out);err!=nil{return "",errors.New("invalid Claude response")}
 var parts []string
 for _,p:=range out.Content {if p.Type=="text" && p.Text!="" {parts=append(parts,p.Text)}}
 result:=strings.TrimSpace(strings.Join(parts,"\n"))
 if result=="" {return "",errors.New("Claude returned empty text")}
 return result,nil
}
