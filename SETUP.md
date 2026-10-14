# セットアップ手順

1. GitHubで空のリポジトリ `replio` を作る（公開前に秘密情報を確認）。
2. このフォルダの内容をリポジトリ直下にコピーする。
3. `git init && git add . && git commit -m "docs: initialize AI-native product discovery"`。
4. GitHubのリモートを設定してpushする。
5. GitHub上で `discovery`, `week-1`, `engineering` の3ラベルを作る。
6. GitHub CLIで `gh auth login` を実行し、`bash scripts/create-week1-issues.sh` を一度だけ実行する。CLIを使わない場合は `issues/` 内の各MarkdownをGitHubのNew Issueへ貼り付ける（先頭のfrontmatterはタイトル・ラベル設定に使い、本文から除く）。
7. GitHub Projectsに7つのIssueを追加し、Todo / In Progress / Doneの状態を管理する。
8. Day 1のIssueに初回コミットをリンクする。

**注意:** このスターターは文書・Issueテンプレート中心で、Webアプリの実装やLP公開を完了したものではありません。
