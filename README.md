# Replio — AI-Native Product Development

> AIを活用して、顧客課題の検証からSaaSの開発・集客・運用・改善までを一貫して実践するプロジェクト。

**Status:** Discovery / 顧客検証中（2026-10-14時点の計画。実際の進捗に応じて更新）  
**Product:** クライアント対応向けAI返信文作成支援（仮説段階）  
**Repository purpose:** 事業化と、プロダクト開発に必要な技術・意思決定・運用能力の検証可能な記録。

## Problem / 課題仮説

メールやチャットで顧客対応する小規模事業者・フリーランスは、返信内容の調整や確約回避に時間を使うことがある。一般的なAIチャットでも代替できるため、専用ツールとしての継続利用価値・支払意思は未検証。

## Proposed solution / 提供価値の仮説

受信文と補足条件を入力し、メール・Slack・一般チャットなどの媒体と文体を選択。確認されていない事実を断定せず、余計な約束を避けた返信案を生成・編集・コピーできる。

## Current phase & evidence

| 項目 | 状態 | 根拠 |
| --- | --- | --- |
| 課題・ターゲット | 仮説 | [事業仮説](docs/01-business/hypothesis.md) |
| 顧客ヒアリング | 未集計 | [検証記録](docs/01-business/validation.md) |
| MVP | 未実装 | Day 7の判断後にスコープ確定 |
| 有料顧客・売上 | 未検証 | 実測後に更新 |
| AI開発プロセス | 方針定義 | [ワークフロー](docs/04-ai-workflow/workflow.md) |

## What this repository demonstrates

1. **Product thinking:** 仮説、顧客検証、価格テスト、Go/Pivot/Stopの判断。
2. **Engineering:** 受入基準、設計の比較、ADR、テスト、セキュリティ、CI/CD。
3. **AI-native workflow:** AIへの委任、成果物の検証、人間によるレビュー、AI提案の不採用理由。
4. **Operations & growth:** 公開後の計測、原価、障害対応、施策の前後比較。

**注意:** 上記は実施方針であり、完了実績ではありません。完了した成果物はPR・Issue・実測値にリンクします。

## Discovery → Build → Launch → Learn

- **Day 1–7:** 仮説、競合調査、LP、顧客接触、意思決定。
- **Day 8–14:** 検証継続・対象絞り込み。需要が確認できなければ開発しない。
- **Day 15+:** Go判定の場合のみMVP要件定義、設計、実装、計測、改善。

[7日間のIssues](issues/day-01-repository-foundation.md) / [判定基準](docs/01-business/hypothesis.md#go--pivot--stop-の暫定判定基準)

## Planned architecture (not implemented)

候補: Next.js + TypeScript、Supabase (Auth/PostgreSQL)、AI API、Stripe、GitHub Actions。技術選定はMVP要件・原価・セキュリティを比較し、ADRで確定する。現時点で構築済みと誤解される図やバッジは掲載しない。

## Engineering quality gates (for implementation phase)

- Issueに目的・受入基準・計測方法を記載。
- PRで差分、テスト結果、リスク、ロールバック方法を説明。
- 自動テスト、静的解析、シークレット検査を導入。
- 認証・認可、テナント分離、入力値検証、レート制限、API費用上限を確認。
- AI生成コードも人間がレビューしてからマージ。

## Public evidence policy

顧客の個人情報、受信メール本文、APIキー、非公開の営業先リスト、決済情報はコミットしない。集計値や匿名化した学びのみ公開。数値には計測期間、定義、母数を添える。AIの出力は一次情報の代わりにしない。

## Repository map

- [`docs/01-business/`](docs/01-business/) — 仮説・検証・競合
- [`docs/04-ai-workflow/`](docs/04-ai-workflow/) — AI利用・レビュー・判断記録
- [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/) — 再現可能なタスク管理
- [`issues/`](issues/) — 最初の7日分のIssue原稿

## License

現時点ではライセンス未設定。公開リポジトリでも第三者に再利用権を付与するものではありません。採用向け公開範囲と商用コードの分離は開発前に判断します。
