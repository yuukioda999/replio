package infrastructure

import "context"

type FakeLLM struct{}

func (FakeLLM) Generate(ctx context.Context, prompt string) (string, error) {
 if err := ctx.Err(); err != nil { return "", err }
 return "ご連絡ありがとうございます。内容を確認のうえ、改めてご連絡いたします。", nil
}
