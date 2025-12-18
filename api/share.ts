export const config = {
    runtime: 'edge',
};

export default function handler(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'unknown';
    const power = searchParams.get('power') || '0';
    const rank = searchParams.get('rank') || '?';
    const name = searchParams.get('name') || '誰か';
    const riasec = searchParams.get('riasec') || '';

    // OGP画像のURLを作成 (自分自身の /api/og を指す)
    const ogImageUrl = new URL(`/api/og`, req.url);
    searchParams.forEach((value, key) => {
        ogImageUrl.searchParams.set(key, value);
    });

    // 本来のLPへのURL
    const appUrl = new URL(`/`, req.url); // ルートに戻る（パラメータはJSで引き継ぐ必要ありだが、今回はLPトップへ）
    // 理想的には /index.html?result=... のように復元してあげると親切

    const title = `【ランク${rank}】${name}さんの社労士戦闘力は「${Number(power).toLocaleString()}」です！`;
    const description = `タイプ: ${type} | RIASEC: ${riasec} | あなたも診断してみよう！`;

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- OGP Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${req.url}" />
    <meta property="og:image" content="${ogImageUrl.toString()}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImageUrl.toString()}" />

    <!-- Redirect script -->
    <script>
      // 0秒後にアプリ本体へリダイレクト
      // パラメータを引き継ぐかどうかは要件次第だが、とりあえずLPへ飛ばす
      setTimeout(() => {
          window.location.href = '/'; 
      }, 500);
    </script>
</head>
<body style="background-color: #1a1a1a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
    <div style="text-align: center;">
        <p>診断結果へリダイレクト中...</p>
        <div style="font-size: 12px; opacity: 0.6;">Moving to the result page...</div>
    </div>
</body>
</html>
  `;

    return new Response(html, {
        headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
}
