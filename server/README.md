# 社労士キャリア診断 - バックエンドサーバー

X (Twitter) APIと連携してアカウント情報を取得するNode.jsサーバーです。

## 🔧 セットアップ

### 1. 依存関係のインストール

```bash
cd server
npm install
```

### 2. X (Twitter) API キーの取得

1. [X Developer Portal](https://developer.twitter.com/) にアクセス
2. アプリケーションを作成
3. **Bearer Token** を取得（API v2用）
4. Free Tier でも使用可能（月間500,000リクエストまで）

### 3. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成:

```bash
cp .env.example .env
```

`.env` ファイルを編集してBearerトークンを設定:

```env
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAABearerTokenHere123456789
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

### 4. サーバーの起動

**開発モード（自動再起動）:**
```bash
npm run dev
```

**本番モード:**
```bash
npm start
```

サーバーは `http://localhost:3000` で起動します。

## 📡 APIエンドポイント

### ヘルスチェック
```
GET /api/health
```

**レスポンス例:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### X アカウント情報取得
```
GET /api/twitter-user/:username
```

**パラメータ:**
- `username`: Xアカウント名（@付きでも@なしでもOK）

**レスポンス例（成功）:**
```json
{
  "success": true,
  "user": {
    "name": "田中太郎",
    "username": "tanaka_sr",
    "profileImageUrl": "https://pbs.twimg.com/profile_images/123.jpg"
  }
}
```

**レスポンス例（エラー）:**
```json
{
  "error": "User not found",
  "message": "アカウント @tanaka_sr が見つかりませんでした"
}
```

## 🚀 デプロイ

### Render.com (推奨・無料)

1. [Render.com](https://render.com/) でアカウント作成
2. **New Web Service** を作成
3. GitHubリポジトリを接続
4. 設定:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**:
     - `TWITTER_BEARER_TOKEN`: X API Bearer Token
     - `FRONTEND_URL`: フロントエンドのURL
5. デプロイ

### Heroku

```bash
# Heroku CLIでログイン
heroku login

# アプリ作成
heroku create sharoushi-diagnostic-api

# 環境変数設定
heroku config:set TWITTER_BEARER_TOKEN=your_token_here
heroku config:set FRONTEND_URL=https://career.gakko.shikumisr.jp

# デプロイ
git push heroku main
```

### Railway

1. [Railway.app](https://railway.app/) でプロジェクト作成
2. GitHub連携でデプロイ
3. 環境変数を設定
4. `server/` ディレクトリを指定

## 🔐 セキュリティ

- `.env` ファイルは **絶対にGitにコミットしない**
- Bearer Tokenは環境変数で管理
- CORSで許可するオリジンを制限
- レート制限対策実装済み

## 📊 レート制限

X API Free Tierの制限:
- **月間**: 500,000リクエスト
- **15分あたり**: 300リクエスト

本アプリの想定使用量:
- 1診断につき1回のAPI呼び出し
- 月間10,000診断でも余裕で対応可能

## 🛠️ トラブルシューティング

### エラー: "Rate limit exceeded"
→ 15分間待つか、X Developer Portalでプランをアップグレード

### エラー: "Unauthorized"
→ Bearer Tokenが正しいか確認

### エラー: "User not found"
→ アカウント名が存在するか確認（@は自動で除去されます）

## 📞 サポート

問題が発生した場合は、社労士Lab開発チームまでお問い合わせください。
