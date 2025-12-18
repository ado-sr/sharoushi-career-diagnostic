require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { TwitterApi } = require('twitter-api-v2');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS設定（フロントエンドからのリクエストを許可）
app.use(cors({
    origin: process.env.FRONTEND_URL || '*'
}));

app.use(express.json());

// Twitter API クライアント初期化
// ※ 無料プランなどでトークンがない場合のエラーハンドリングを追加
let readOnlyClient;
try {
    if (process.env.TWITTER_BEARER_TOKEN) {
        const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
        readOnlyClient = twitterClient.readOnly;
    }
} catch (e) {
    console.warn('Twitter Client Setup Failed:', e);
}

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Xアカウント情報取得エンドポイント
app.get('/api/twitter-user/:username', async (req, res) => {
    try {
        if (!readOnlyClient) {
            return res.status(503).json({
                error: 'Service unavailable',
                message: '現在X API連携機能は利用できません（APIキー未設定）'
            });
        }

        const { username } = req.params;

        // @を取り除く
        const cleanUsername = username.replace('@', '');

        // X API v2でユーザー情報を取得
        const user = await readOnlyClient.v2.userByUsername(cleanUsername, {
            'user.fields': ['profile_image_url', 'name', 'username']
        });

        if (!user.data) {
            return res.status(404).json({
                error: 'User not found',
                message: `アカウント @${cleanUsername} が見つかりませんでした`
            });
        }

        // 必要な情報だけを返す
        res.json({
            success: true,
            user: {
                name: user.data.name,
                username: user.data.username,
                profileImageUrl: user.data.profile_image_url.replace('_normal', '_400x400') // 高解像度版
            }
        });

    } catch (error) {
        console.error('X API Error:', error);

        if (error.code === 429) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'APIのレート制限に達しました。しばらくお待ちください。'
            });
        }

        res.status(500).json({
            error: 'Server error',
            message: 'サーバーエラーが発生しました',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: 'サーバー内部エラーが発生しました'
    });
});

// サーバー起動
// Vercelなどのサーバーレス環境では、appをエクスポートするだけで良い
// ローカル実行時のみ listen する
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🐦 X API endpoint: http://localhost:${PORT}/api/twitter-user/:username`);
    });
}

module.exports = app;
