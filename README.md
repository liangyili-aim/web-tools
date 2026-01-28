# My Web Tools

Pythonスクリプトをウェブアプリケーションに変換したプロジェクト。

## 機能

- 📧 **メール照合** - 2つのメールリストを比較し、重複と新規を検出
- 🌐 **IPチェック** - IP/CIDR形式の検証、ネットワーク重複の確認
- 🔐 **パスワード生成** - 安全なランダムパスワードを生成、一括生成とCSV出力対応

## 技術スタック

- **フロントエンド**: Vue.js 3 (Composition API)
- **ビルドツール**: Vite
- **CSSフレームワーク**: Tailwind CSS + DaisyUI
- **ルーティング**: Vue Router
- **デプロイ**: GitHub Pages + GitHub Actions

## 開発

```bash
# プロジェクトディレクトリに移動（重要：必ずこのディレクトリで実行）
cd my-web-tools

# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# 本番ビルドのプレビュー
npm run preview
```

> ⚠️ **注意**: すべての npm コマンドは `my-web-tools` ディレクトリ内で実行してください。

## デプロイ

GitHub Actions による自動デプロイを設定済み：
- `main` ブランチへのプッシュ時に自動トリガー
- 自動でビルドし、GitHub Pages にデプロイ

## プライバシー

すべてのデータ処理はブラウザ内で完結し、サーバーにアップロードされることはありません。

## ローカルCLI
- pythonインストール済み
- 'ipchk','pwdgen','emailchk'を'/usr/local/bin'にコピー
- teminalで実行できるようになる

## ライセンス

MIT License
