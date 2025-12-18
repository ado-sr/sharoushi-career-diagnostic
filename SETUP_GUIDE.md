# セットアップガイド

## 完了しました！🎉

Xアカウント情報を自動取得できる社労士キャリア診断ツールが完成しました。

## 📁 プロジェクト構成

```
sharoushi_career_diagnostic/
├── index.html              # フロントエンド（診断ツール本体）
├── README.md              # プロジェクト概要
├── SETUP_GUIDE.md         # このファイル
└── server/                # バックエンドサーバー
    ├── server.js          # Express.jsサーバー
    ├── package.json       # 依存関係
    ├── .env.example       # 環境変数のテンプレート
    ├── .gitignore         # Gitignore
    └── README.md          # サーバー詳細ドキュメント
```

## 🚀 クイックスタート

### ステップ1: バックエンドサーバーのセットアップ

1. **サーバーディレクトリに移動**
   ```bash
   cd C:\Users\hidea\sharoushi_career_diagnostic\server
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **X API キーを取得**
   - [X Developer Portal](https://developer.twitter.com/) でアカウント作成
   - 新しいアプリを作成
   - **Bearer Token** をコピー（無料のFree Tierで十分）

4. **環境変数を設定**
   ```bash
   copy .env.example .env
   ```

   `.env` ファイルを編集して、Bearer Tokenを貼り付け:
   ```env
   TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAABearerTokenHere
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=*
   ```

5. **サーバーを起動**
   ```bash
   npm start
   ```

   成功すると以下のように表示されます:
   ```
   🚀 Server is running on port 3000
   📍 Health check: http://localhost:3000/api/health
   🐦 X API endpoint: http://localhost:3000/api/twitter-user/:username
   ```

### ステップ2: フロントエンドを開く

1. **新しいターミナルを開く**（サーバーは起動したまま）

2. **診断ツールを開く**
   ```bash
   start C:\Users\hidea\sharoushi_career_diagnostic\index.html
   ```

   または、ブラウザで直接 `C:\Users\hidea\sharoushi_career_diagnostic\index.html` を開く

### ステップ3: 動作確認

1. 診断ツールが開いたら、Xアカウント名を入力欄に入力
   - 例: `@elonmusk` や `elonmusk`（@は自動で除去されます）

2. **「取得」ボタン**をクリック

3. 成功すると:
   - アイコン画像が表示される
   - ニックネームとアカウント名が表示される
   - 入力欄が緑色に変わる

4. **「診断をはじめる」**をクリックして、24問の診断を進める

5. 結果画面で:
   - 取得したアイコンとニックネームが表示される
   - 診断結果（4タイプ）
   - RIASEC分析
   - 友達との相性比較機能

## 🔍 トラブルシューティング

### エラー: "サーバーに接続できませんでした"

**原因**: バックエンドサーバーが起動していない

**解決策**:
1. `server/` ディレクトリでサーバーが起動しているか確認
2. `http://localhost:3000/api/health` にブラウザでアクセス
3. `{"status":"OK","message":"Server is running"}` と表示されればOK

### エラー: "アカウント情報を取得できませんでした"

**原因**: X APIの認証エラー

**解決策**:
1. `.env` ファイルの `TWITTER_BEARER_TOKEN` が正しいか確認
2. X Developer Portal でトークンが有効か確認
3. サーバーを再起動: `Ctrl+C` → `npm start`

### アカウント名が見つからない

**原因**: 存在しないアカウント名、または非公開アカウント

**解決策**:
1. Xで実際に存在するアカウント名か確認
2. @付きでも@なしでも動作します
3. 非公開アカウントは取得できません

### バックエンドなしで使いたい

Xアカウント情報の自動取得は**不要**な場合:
- バックエンドサーバーを起動せずに `index.html` を開くだけでOK
- 入力欄に好きなニックネームを入力すれば、そのまま診断可能
- アイコンは表示されませんが、ニックネームは表示されます

## 📊 利用可能な機能

### ✅ 完全実装済み

1. **条件分岐型の質問フロー（24問）**
   - スタート質問: 1問
   - 個別経路: 3問（受験生/合格者/実務者/ベテラン）
   - 共通質問: 3問
   - RIASEC測定: 16問
   - ワークライフバランス: 1問

2. **4つの診断結果タイプ**
   - 🌱 成長志向タイプ → シャロスタ
   - 💼 実務重視タイプ → 社労士Labコミュニティ
   - ⚖️ 専門特化タイプ → リーガルラボ
   - 🚀 独立志向タイプ → 社労士Labコミュニティ

3. **キャリア理論に基づく診断**
   - Edgar Schein のキャリア・アンカー理論
   - John Holland の RIASEC 理論
   - Donald Super のライフキャリア理論

4. **RIASEC分析**
   - 6次元スコア（R, I, A, S, E, C）
   - TOP3ハイライト
   - 3文字RIASECコード
   - 六角形チャート
   - 詳細な次元別説明

5. **バイラル機能**
   - レア度表示（激レア10%, レア15%, ふつう40%, よくいる35%）
   - バッジ・称号システム
   - キャッチフレーズ
   - Twitter/LINE シェアボタン
   - 友達との相性比較（コサイン類似度）

6. **Xアカウント連携** ← **NEW!**
   - アカウント名入力でアイコン自動取得
   - ニックネーム自動取得
   - 結果画面でアイコン+ニックネーム表示
   - 手動ニックネーム入力も可能

7. **UX/UI**
   - レスポンシブデザイン
   - プログレスバー（24問中の進捗）
   - スムーズなアニメーション
   - モダンなグラデーション

## 🌐 本番環境へのデプロイ

### バックエンド（Render.com推奨）

1. [Render.com](https://render.com/) でアカウント作成
2. **New Web Service** を作成
3. GitHubリポジトリを接続
4. 設定:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `TWITTER_BEARER_TOKEN`: あなたのBearer Token
     - `FRONTEND_URL`: `*` または特定のドメイン
5. デプロイ後、URLをコピー（例: `https://your-backend.onrender.com`）

### フロントエンド（Netlify推奨）

1. [Netlify](https://www.netlify.com/) でアカウント作成
2. GitHubリポジトリを接続、またはドラッグ&ドロップ
3. デプロイ後、`index.html` を編集:
   ```javascript
   // 行1107を編集
   const API_BASE_URL = 'https://your-backend.onrender.com';
   ```
4. 再デプロイ

これで全世界に公開できます！

## 📞 サポート

質問や問題があれば、社労士Lab開発チームまでお問い合わせください。

---

**制作**: 社労士Lab開発チーム
**バージョン**: 2.0.0 (X API連携対応)
**最終更新**: 2025年12月18日
