/**
 * 社労士キャリア診断 - Google Sheets 連携スクリプト
 *
 * セットアップ方法:
 * 1. Googleスプレッドシートを新規作成
 * 2. 「拡張機能」→「Apps Script」を開く
 * 3. このコードをコピー&ペースト
 * 4. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」として公開
 * 5. アクセス権限: 「全員」に設定
 * 6. デプロイURLをコピーして、index.htmlに貼り付け
 */

// POSTリクエストを受け取る関数
function doPost(e) {
  try {
    // JSONデータを解析
    const data = JSON.parse(e.postData.contents);

    // スプレッドシートを取得（このスクリプトが紐づいているシート）
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // ヘッダー行がない場合は作成
    if (sheet.getLastRow() === 0) {
      const headers = [
        '診断日時',
        'ニックネーム',
        'Xアカウント名',
        'プロフィール画像URL',
        '経験レベル',
        '診断タイプ',
        'セグメント',
        'RIASECコード',
        'R (現実的)',
        'I (研究的)',
        'A (芸術的)',
        'S (社会的)',
        'E (企業的)',
        'C (慣習的)',
        '信頼度 (%)',
        'レア度 (%)',
        'レアレベル',
        'キャリア・アンカー',
        'バッジ',
        '回答パス',
        '全回答詳細',
        'User Agent',
        'リファラー'
      ];
      sheet.appendRow(headers);

      // ヘッダー行をフォーマット
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#0066FF');
      headerRange.setFontColor('#FFFFFF');
    }

    // セグメント判定（経験レベルと診断タイプから推測）
    let segment = '';
    if (data.experienceLevel === '受験生') {
      segment = '受験生';
    } else if (data.resultType === '🚀 独立志向タイプ') {
      segment = '開業希望';
    } else if (data.experienceLevel === '合格者（未就職）') {
      segment = '就職希望';
    } else if (data.resultType === '💼 実務重視タイプ') {
      segment = '転職検討中';
    } else if (data.resultType === '⚖️ 専門特化タイプ') {
      segment = '専門性追求';
    } else {
      segment = 'その他';
    }

    // 全回答詳細をテキスト形式に変換
    let allAnswersText = '';
    if (data.userAnswers) {
      const answersArray = Object.entries(data.userAnswers)
        .map(([key, value]) => ({
          key: key,
          ...value
        }))
        .sort((a, b) => a.questionNumber - b.questionNumber);

      allAnswersText = answersArray.map(answer =>
        `Q${answer.questionNumber}: ${answer.question} → ${answer.answer}`
      ).join('\n');
    }

    // データ行を作成
    const row = [
      new Date(data.timestamp),                    // 診断日時
      data.nickname || '',                         // ニックネーム
      data.twitterUsername || '',                  // Xアカウント名
      data.profileImageUrl || '',                  // プロフィール画像URL
      data.experienceLevel || '',                  // 経験レベル
      data.resultType || '',                       // 診断タイプ
      segment,                                     // セグメント
      data.riasecCode || '',                       // RIASECコード
      data.riasecScores?.R || 0,                   // R
      data.riasecScores?.I || 0,                   // I
      data.riasecScores?.A || 0,                   // A
      data.riasecScores?.S || 0,                   // S
      data.riasecScores?.E || 0,                   // E
      data.riasecScores?.C || 0,                   // C
      data.confidence || 0,                        // 信頼度
      data.rarity || 0,                            // レア度
      data.rarityLevel || '',                      // レアレベル
      data.careerAnchor || '',                     // キャリア・アンカー
      data.badge || '',                            // バッジ
      data.userPath?.join(' → ') || '',           // 回答パス
      allAnswersText,                              // 全回答詳細
      data.userAgent || '',                        // User Agent
      data.referrer || ''                          // リファラー
    ];

    // 行を追加
    sheet.appendRow(row);

    // 成功レスポンス
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'データが保存されました',
        rowNumber: sheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // エラーレスポンス
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GETリクエスト（統計情報の取得）
function doGet(e) {
  try {
    // ?action=stats のパラメータで統計情報を返す
    const action = e.parameter.action;

    if (action === 'stats') {
      return getStatistics();
    }

    // デフォルトレスポンス
    return ContentService
      .createTextOutput('社労士キャリア診断 - データ収集API\n\nPOSTリクエストでデータを送信してください。')
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 統計情報を取得する関数
 */
function getStatistics() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    // データがない場合
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        totalCount: 0,
        averageRiasec: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = data[0];
  const rows = data.slice(1); // ヘッダーをスキップ

  // RIASECスコアの列インデックスを取得
  const rIndex = headers.indexOf('R (現実的)');
  const iIndex = headers.indexOf('I (研究的)');
  const aIndex = headers.indexOf('A (芸術的)');
  const sIndex = headers.indexOf('S (社会的)');
  const eIndex = headers.indexOf('E (企業的)');
  const cIndex = headers.indexOf('C (慣習的)');

  // 合計値を計算
  let sumR = 0, sumI = 0, sumA = 0, sumS = 0, sumE = 0, sumC = 0;
  let count = rows.length;

  rows.forEach(row => {
    sumR += Number(row[rIndex]) || 0;
    sumI += Number(row[iIndex]) || 0;
    sumA += Number(row[aIndex]) || 0;
    sumS += Number(row[sIndex]) || 0;
    sumE += Number(row[eIndex]) || 0;
    sumC += Number(row[cIndex]) || 0;
  });

  // 平均値を計算
  const averageRiasec = {
    R: Math.round(sumR / count * 10) / 10,
    I: Math.round(sumI / count * 10) / 10,
    A: Math.round(sumA / count * 10) / 10,
    S: Math.round(sumS / count * 10) / 10,
    E: Math.round(sumE / count * 10) / 10,
    C: Math.round(sumC / count * 10) / 10
  };

  // レスポンスを返す
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      totalCount: count,
      averageRiasec: averageRiasec
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 回答詳細を別シートに保存する関数
 */
function saveAnswerDetails(userAnswers, nickname, timestamp, mainRowNumber) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 「回答詳細」シートを取得または作成
  let detailSheet = ss.getSheetByName('回答詳細');
  if (!detailSheet) {
    detailSheet = ss.insertSheet('回答詳細');

    // ヘッダー行を作成
    const headers = [
      '診断日時',
      'ニックネーム',
      '質問番号',
      '質問',
      '回答',
      '参照行'
    ];
    detailSheet.appendRow(headers);

    // ヘッダー行をフォーマット
    const headerRange = detailSheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#00C896');
    headerRange.setFontColor('#FFFFFF');
  }

  // 回答を質問番号順にソート
  const answersArray = Object.entries(userAnswers).map(([key, value]) => ({
    key: key,
    ...value
  })).sort((a, b) => a.questionNumber - b.questionNumber);

  // 各回答を行として追加
  answersArray.forEach(answer => {
    const row = [
      new Date(timestamp),
      nickname || '',
      answer.questionNumber,
      answer.question,
      answer.answer,
      mainRowNumber
    ];
    detailSheet.appendRow(row);
  });
}

/**
 * データ集計用の関数（手動実行用）
 *
 * スプレッドシートのメニューから実行できます
 */
function createSummarySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 「集計」シートを作成（既存の場合は削除して再作成）
  let summarySheet = ss.getSheetByName('集計');
  if (summarySheet) {
    ss.deleteSheet(summarySheet);
  }
  summarySheet = ss.insertSheet('集計');

  const dataSheet = ss.getSheets()[0]; // 最初のシート
  const data = dataSheet.getDataRange().getValues();

  // ヘッダーをスキップ
  const headers = data[0];
  const rows = data.slice(1);

  // セグメント別集計
  const segmentCount = {};
  const typeCount = {};
  const experienceCount = {};

  rows.forEach(row => {
    const segment = row[6]; // セグメント列
    const type = row[5];    // 診断タイプ列
    const experience = row[4]; // 経験レベル列

    segmentCount[segment] = (segmentCount[segment] || 0) + 1;
    typeCount[type] = (typeCount[type] || 0) + 1;
    experienceCount[experience] = (experienceCount[experience] || 0) + 1;
  });

  // 集計結果を書き込み
  let currentRow = 1;

  // セグメント別集計
  summarySheet.getRange(currentRow, 1).setValue('【セグメント別集計】');
  summarySheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14);
  currentRow += 2;

  summarySheet.getRange(currentRow, 1, 1, 2).setValues([['セグメント', '人数']]);
  summarySheet.getRange(currentRow, 1, 1, 2).setFontWeight('bold').setBackground('#E8F4F8');
  currentRow++;

  Object.entries(segmentCount).forEach(([segment, count]) => {
    summarySheet.getRange(currentRow, 1, 1, 2).setValues([[segment, count]]);
    currentRow++;
  });

  currentRow += 2;

  // 診断タイプ別集計
  summarySheet.getRange(currentRow, 1).setValue('【診断タイプ別集計】');
  summarySheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14);
  currentRow += 2;

  summarySheet.getRange(currentRow, 1, 1, 2).setValues([['診断タイプ', '人数']]);
  summarySheet.getRange(currentRow, 1, 1, 2).setFontWeight('bold').setBackground('#E8F4F8');
  currentRow++;

  Object.entries(typeCount).forEach(([type, count]) => {
    summarySheet.getRange(currentRow, 1, 1, 2).setValues([[type, count]]);
    currentRow++;
  });

  currentRow += 2;

  // 経験レベル別集計
  summarySheet.getRange(currentRow, 1).setValue('【経験レベル別集計】');
  summarySheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14);
  currentRow += 2;

  summarySheet.getRange(currentRow, 1, 1, 2).setValues([['経験レベル', '人数']]);
  summarySheet.getRange(currentRow, 1, 1, 2).setFontWeight('bold').setBackground('#E8F4F8');
  currentRow++;

  Object.entries(experienceCount).forEach(([experience, count]) => {
    summarySheet.getRange(currentRow, 1, 1, 2).setValues([[experience, count]]);
    currentRow++;
  });

  // 列幅を自動調整
  summarySheet.autoResizeColumns(1, 2);

  SpreadsheetApp.getUi().alert('集計シートを作成しました！');
}

/**
 * カスタムメニューを追加
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 診断データ')
    .addItem('集計シートを作成', 'createSummarySheet')
    .addToUi();
}
