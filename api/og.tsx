import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'beginner';
  const power = searchParams.get('power') || '0';
  const rank = searchParams.get('rank') || 'C';
  const name = searchParams.get('name') || 'ゲスト';
  const riasec = searchParams.get('riasec') || 'S-E-I';

  // Vercelにデプロイされた後のベースURL
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('host');
  const baseUrl = `${protocol}://${host}`;

  // 16種類 (4タイプ x 4ランク) の画像マップ
  // 命名規則: type_[type]_rank_[rank]_anime.png
  // 小文字に統一して処理
  const normalizedType = type.toLowerCase();
  const normalizedRank = rank.toLowerCase();

  const getBgImageUrl = (t: string, r: string) => `${baseUrl}/assets/type_${t}_rank_${r}_anime.png`;

  // フォールバックロジック:
  // まず指定された Type x Rank の画像を探すが、
  // 現状生成できているのは一部のみかもしれないため、
  // 生成失敗時は既存の Type別画像 (type_[type]_anime.png) や Rank別画像などへフォールバックする実装が理想。
  // しかし Vercel OG内でのファイル存在確認は難しいため、
  // クライアント側で担保するか、とりあえず全パターンへのパスを生成してアクセスさせる。
  // 404になった場合は画像が表示されないため、確実に存在するパスを指定する必要がある。

  // 今回は「生成できたものはそれを、まだのものは従来のType画像」にマッピングする
  // 生成済み: Rank C全種, Rank B(practitioner, expert, entrepreneur)
  // 未生成: Rank B(beginner), Rank A全種, Rank S全種 -> これらは Type別共通画像 or 近似画像へ

  // 簡易マッピング
  const bgImageStart = `${baseUrl}/assets/type_${normalizedType}_rank_${normalizedRank}_anime.png`;

  // 未生成分を個別にフォールバック設定 (暫定対応)
  let bgImage = bgImageStart;

  // Rank A, S, Beginner B はまだないので、Type別共通画像 (前回生成したもの) に逃がす
  // ただし前回生成した type_beginner_anime.png 等は上書きされていない前提であれば使えるが、
  // 今回のタスクで assets にあるのは:
  // - type_beginner_rank_c_anime.png
  // - type_practitioner_rank_c_anime.png ... etc
  // - type_beginner_anime.png (前回の残り)

  // 確実に存在するものを使う
  // Rank C はある
  if (normalizedRank === 'c') {
    bgImage = `${baseUrl}/assets/type_${normalizedType}_rank_c_anime.png`;
  }
  // Rank B の一部はある
  else if (normalizedRank === 'b') {
    if (normalizedType === 'beginner') {
      // Beginner B 失敗 -> Beginner C で代用
      bgImage = `${baseUrl}/assets/type_beginner_rank_c_anime.png`;
    } else {
      bgImage = `${baseUrl}/assets/type_${normalizedType}_rank_b_anime.png`;
    }
  }
  // Rank A, S はまだない -> Rank C または B で代用
  else {
    // Practitioner, Expert, Entrepreneur は Rank B があるのでそれを使う
    if (normalizedType !== 'beginner') {
      bgImage = `${baseUrl}/assets/type_${normalizedType}_rank_b_anime.png`;
    } else {
      // Beginner は Rank C しかない
      bgImage = `${baseUrl}/assets/type_beginner_rank_c_anime.png`;
    }
  }

  const rankColor = rank === 'S' ? '#FFD700' : rank === 'A' ? '#FF6B6B' : rank === 'B' ? '#00C896' : '#88CC88';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // 画像を背景に設定
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontFamily: '"Noto Sans JP", sans-serif',
          textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 20,
            padding: 40,
            width: '90%',
            height: '90%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: `2px solid ${rankColor}`,
            color: 'white',
          }}
        >
          {/* POTENTIAL POWER */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 40,
              width: '100%',
              padding: '20px 0',
            }}
          >
            <div style={{ fontSize: 32, color: '#DDD', fontWeight: 'bold', letterSpacing: '0.1em' }}>POTENTIAL POWER</div>
            <div style={{ fontSize: 130, fontWeight: 900, color: '#FFF', textShadow: `0 0 30px ${rankColor}`, lineHeight: 1 }}>
              {parseInt(power).toLocaleString()}
            </div>
            <div style={{ display: 'flex', marginTop: 10 }}>
              <div style={{
                background: rank === 'S' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                border: `2px solid ${rankColor}`,
                color: rankColor,
                padding: '5px 20px',
                fontSize: 30,
                borderRadius: 50,
                fontWeight: 'bold',
                textShadow: 'none'
              }}>
                RANK {rank}
              </div>
            </div>
          </div>

          <div style={{ width: '80%', height: 2, background: 'rgba(255,255,255,0.3)', margin: '20px 0' }} />

          {/* USER INFO */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 50, fontWeight: 'bold', marginBottom: 10 }}>{name}</div>
            <div style={{ fontSize: 30, color: '#DDD' }}>社労士キャリア診断結果</div>
          </div>

          {/* RESULTS */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 30 }}>
            <div style={{ fontSize: 70, fontWeight: 'bold', color: rankColor }}>{type}</div>
            <div style={{ fontSize: 40, color: '#CCC', marginTop: 10 }}>RIASEC: {riasec}</div>
          </div>

          <div style={{ position: 'absolute', bottom: 30, fontSize: 24, color: '#AAA' }}>
            社労士Lab
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
