# Day 1 — GitHubリポジトリ初期構築

**プロジェクト：** Replio — AI返信文生成SaaS  
**実施日：** 2026年10月14日  
**ステータス：** 完了  
**GitHub：** https://github.com/yuukioda999/replio

## 1. 本日の目的

AIを活用したSaaSの企画・開発・マーケティング・運用を一貫して実践し、事業化とエンジニアとしての技術力証明を両立するため、GitHubの開発基盤を整備する。

## 2. 実施した作業

### ① GitHubリポジトリの作成

- Replio用のGitHubリポジトリを作成
- ローカルGitリポジトリとGitHubを接続
- `main` ブランチへの初回Pushを実施
- プロジェクトの初期ファイルをGitHubに登録

**成果物：** [yuukioda999/replio](https://github.com/yuukioda999/replio)

### ② プロジェクトドキュメントの整備

以下の内容を管理するための初期構成をGitHubに登録した。

- `README.md`：プロジェクト概要、目的、開発方針
- `docs/01-business/hypothesis.md`：事業仮説、ターゲット、課題、検証方針
- `docs/04-ai-workflow/workflow.md`：AI駆動開発の進め方
- `SETUP.md`：開発環境とGitHubの初期設定手順
- `.github/ISSUE_TEMPLATE/`：Issue管理用テンプレート
- `scripts/create-week1-issues.sh`：初週のIssue作成スクリプト

### ③ GitHub Issuesの管理基盤を構築

GitHub CLIを利用してIssue管理の初期設定を実施した。

以下のラベルを作成した。

| ラベル | 用途 |
|---|---|
| `discovery` | 市場調査・顧客検証 |
| `week-1` | 最初の7日間のタスク |
| `engineering` | 設計・開発・技術検証 |

最初の7日間の作業をIssueとして管理するための準備を整えた。

**Issue一覧：** https://github.com/yuukioda999/replio/issues

### ④ Git操作のトラブルシューティング

**問題1：`remote origin already exists`**

原因：Gitのリモート接続先 `origin` がすでに登録されていた。

対応：既存のリモート設定を削除し、正しいGitHubリポジトリのURLを再登録した。

**問題2：`No such remote 'origin'`**

原因：`origin` を削除した状態で `git remote set-url` を実行した。

対応：`git remote add origin` を利用して新規登録した。

**問題3：`could not add label: 'discovery' not found`**

原因：Issue作成時に指定したGitHubラベルが存在していなかった。

対応：必要なラベルをGitHub CLIで作成し、Issue登録を再実行した。

## 3. 技術的な学び

- Gitのリモート設定の追加・変更・削除方法
- GitHub CLIによるIssue管理
- GitHubラベルを利用したタスク分類
- 開発作業と事業検証を同一リポジトリで管理する方法
- トラブル発生時にエラーメッセージから原因を特定し、修正する流れ

## 4. AI活用の記録

**利用AI：** ChatGPT

**AIに任せた作業**
- プロジェクトの初期構成の提案
- README・事業仮説・AI開発フローのドラフト作成
- GitHub Issuesの設計
- Git操作エラーの原因分析と修正コマンドの提案

**人間が担当した作業**
- GitHubリポジトリの作成
- Gitコマンドの実行
- GitHubへのPush
- エラー発生時の状況確認
- GitHubラベル・Issue管理の設定操作

**振り返り**

AIを設計・ドキュメント作成・トラブルシューティングの補助として活用しながら、実際の環境操作と結果確認を人間が担当する開発プロセスを開始した。

## 5. 本日の成果

- [x] GitHubリポジトリ作成
- [x] ローカルGitとGitHubの接続
- [x] 初回Push
- [x] 初期ドキュメントの登録
- [x] GitHubラベルの作成
- [x] Issue作成スクリプトの実行
- [x] Git操作エラーの解決

※ Issueの登録件数はGitHub上で最終確認する。

## 6. 次回の作業 — Day 2

**テーマ：ターゲット顧客と課題の明確化**

1. Replioの初期ターゲットを選定する
2. 顧客が抱える返信業務の課題を整理する
3. ChatGPTなど既存サービスとの差別化仮説を作成する
4. 顧客ヒアリング項目を設計する
5. 事業仮説ドキュメントを更新する

**次回の成果物：** `docs/01-business/hypothesis.md` の更新

---

## Day 1 総括

Replioの事業化と技術力証明に向けて、GitHubを中心とした開発・タスク管理基盤を構築した。

初日はアプリケーション実装を行わず、事業仮説・AI活用方針・開発プロセスを記録できる環境の整備に集中した。

今後は、実際の顧客検証、設計、実装、リリース、運用、改善の各段階で、意思決定と成果を継続的に記録していく。