export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { ingredients } = req.body;
  if (!ingredients || !ingredients.length) {
    return res.status(400).json({ error: '請提供食材清單' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '尚未設定 GEMINI_API_KEY 環境變數' });
  }

  const prompt = `你是一位剩食拯救大廚。請利用以下食材設計一道極簡電鍋料理：${ingredients.join('、')}。請輸出料理名稱、準備步驟、電鍋加水與烹調時間、調味建議。`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini 請求失敗' });
    }

    const recipeText = data.candidates?.[0]?.content?.parts?.[0]?.text || '未能產生食譜';
    return res.status(200).json({ recipe: recipeText });
  } catch (err) {
    return res.status(500).json({ error: '伺服器錯誤: ' + err.message });
  }
}
