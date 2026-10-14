#!/usr/bin/env bash
set -euo pipefail
# GitHub CLI (gh) でログイン後、対象リポジトリのルートから実行。
# 既存Issueがある場合は重複するため、初回だけ実行してください。
for f in issues/day-*.md; do
  title=$(sed -n 's/^title: "\(.*\)"$/\1/p' "$f" | head -1)
  # labelsはリポジトリで事前作成する。存在しない場合は --label を外す。
  gh issue create --title "$title" --body-file "$f" --label discovery --label week-1
done
