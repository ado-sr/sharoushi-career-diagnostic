# GitHub & Vercel セットアップガイド 🚀

このガイドでは、`sharoushi_career_diagnostic` プロジェクトをGitHubで管理し、Vercelにデプロイして全世界に公開する手順を説明します。

## 前提条件

- GitHubアカウントを持っていること
- Vercelアカウントを持っていること
- Node.jsがインストールされていること
- Gitがインストールされていること

---

## ステップ1: Gitの初期設定とコミット

まず、ローカルのプロジェクトをGitで管理できるようにします。

1. **ターミナルを開く**
   プロジェクトのルートディレクトリ（`sharoushi_career_diagnostic/`）でターミナルを開きます。

2. **Gitの初期化**
   以下のコマンドを実行します：
   ```bash
   git init
   ```

3. **全ファイルを追加**
   ```bash
   git add .
   ```

4. **最初のコミット**
   ```bash
   git commit -m "Initial commit"
   ```

---

## ステップ2: GitHubリポジトリの作成とプッシュ

1. [GitHub](https://github.com/new) にアクセスし、新しいリポジトリを作成します。
   - **Repository name**: `sharoushi-career-diagnostic` (例)
   - **Public** を選択
   - "Create repository" をクリック

2. 作成後の画面に表示されるコマンドを使って、ローカルのコードをGitHubにプッシュします。
   （「...or push an existing repository from the command line」の部分）

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/sharoushi-career-diagnostic.git
   git branch -M main
   git push -u origin main
   ```
   ※ `YOUR_USERNAME` は自分のユーザー名に置き換えてください。

---

## ステップ3: Vercelへのデプロイ

フロントエンドとバックエンド（Expressサーバー）をまとめてVercelにデプロイします。
今回作成した `vercel.json` という設定ファイルのおかげで、自動的に構成が認識されます。

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセスし、**"Add New..."** > **"Project"** をクリック。

2. **Import Git Repository** で、先ほど作成した `sharoushi-career-diagnostic` の **"Import"** ボタンをクリック。

3. **Configure Project** 画面で以下の設定を行います：

   - **Project Name**: そのままでOK（例: `sharoushi-career-diagnostic`）
   - **Framework Preset**: `Other`（または自動検出されたもの）
   - **Root Directory**: `./` (空欄のまま)

4. **Environment Variables**（環境変数）を設定します。
   `.env` ファイルの内容をここに登録します。

   | Key | Value |
   |-----|-------|
   | `TWITTER_BEARER_TOKEN` | あなたのX API Bearer Token |
   | `FRONTEND_URL` | `https://あなたのプロジェクト名.vercel.app` (デプロイ後に確定しますが、一旦 `*` でも可) |

   ※ `PORT` はVercelが自動設定するため不要です。

5. **"Deploy"** をクリック！

   ビルドが始まり、数分で完了します。🎊

---

## ステップ4: 動作確認

デプロイが完了すると、VercelからURL（ドメイン）が発行されます（例: `https://sharoushi-career-diagnostic.vercel.app`）。

1. **サイトにアクセス**
   トップページが表示されるか確認します。

2. **APIの確認**
   ブラウザのアドレスバーに以下を入力してアクセスしてみます：
   `https://[あなたのドメイン]/api/health`

   `{"status":"OK","message":"Server is running"}` と表示されれば、バックエンドも正常に動作しています。

3. **X連携のテスト**
   トップページの入力欄にXのユーザー名を入力して「取得」ボタンを押してみてください。
   アイコンが表示されれば成功です！

---

## トラブルシューティング

### よくあるエラー

- **`Cannot find module ...` エラー**
  バックエンドの依存関係が見つからない場合に発生します。
  ルートディレクトリで以下を実行して、`package-lock.json` を更新してからプッシュしてみてください。
  ```bash
  cd server
  npm install
  cd ..
  git add .
  git commit -m "Update dependencies"
  git push
  ```
  ※ Vercelは `server/package.json` を自動検出してインストールしてくれるはずですが、うまくいかない場合はルートにも `package.json` を統合することを検討してください。

- **404 Not Found (API)**
  `vercel.json` が正しく配置されているか確認してください。ルートディレクトリにある必要があります。

---

**完了です！世界中の社労士受験生にシェアしましょう！** 📢
