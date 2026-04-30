import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const hasGeminiConfig = Boolean(
  process.env.GEMINI_API_KEY
  && !process.env.GEMINI_API_KEY.toLowerCase().includes('placeholder')
  && process.env.GEMINI_MODEL
);

export const aiService = {
  /**
   * Generates a professional market insight summary using Gemini
   */
  async generateMarketSummary(comments, assetName, currentPrice, news = []) {
    if (hasGeminiConfig) {
      try {
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

        const commentContext = comments.slice(0, 30).map(c => `[${c.source}] ${c.sentiment}: ${c.text}`).join('\n');
        const newsContext = news.slice(0, 5).map(n => n.title).join('\n');

        const prompt = `
          Görevin bir kıdemli finansal analist ve sosyal medya duyarlılık uzmanı olarak hareket etmektir.
          Aşağıdaki verileri kullanarak ${assetName} (Fiyat: ${currentPrice}) için bir "Market Pulse" raporu hazırla.

          HAM VERİLER (Yorumlar):
          ${commentContext}

          GÜNCEL HABERLER:
          ${newsContext}

          ANALİZ KURALLARI:
          1. Yanıtı mutlaka Türkçe ver.
          2. Sentiment (Duyarlılık) analizi yap: Bullish (Pozitif), Bearish (Negatif) veya Neutral (Nötr).
          3. Pulse Score (0-100): 100 tam boğa, 0 tam ayı piyasasıdır.
          4. "mainSummary" başlığı altında tek cümlelik vurucu bir ana sonuç yaz.
          5. "summary" objesi içinde pozitif, negatif ve nötr görüşlerin ana temalarını ayrı ayrı açıkla.
          6. "globalInsight" kısmında piyasadaki asıl korkuyu veya heyecanı tetikleyen makro durumu yorumla.

          JSON FORMATINDA YANIT VER (Sadece JSON):
          {
            "sentiment": "Positive|Negative|Neutral",
            "pulseScore": 0-100,
            "mainSummary": "Kısa ana özet...",
            "summary": {
              "positive": "Pozitif görüşlerin özeti...",
              "negative": "Negatif görüşlerin özeti...",
              "neutral": "Nötr görüşlerin özeti..."
            },
            "globalInsight": "Makro analiz ve genel piyasa havası..."
          }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response (handling potential markdown formatting)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid AI response format");

      } catch (err) {
        console.warn("[AI] Gemini failed or key issues, using heuristic fallback:", err.message);
        return this.heuristicFallback(comments, assetName, currentPrice);
      }
    }

    return this.heuristicFallback(comments, assetName, currentPrice);
  },

  /**
   * Rule-based analysis for cases where AI is unavailable
   */
  heuristicFallback(comments, assetName, currentPrice) {
    if (!comments || comments.length === 0) {
      return {
        sentiment: 'Neutral',
        pulseScore: 50,
        mainSummary: `${assetName} için şu an yeterli sosyal veri bulunamadı.`,
        summary: {
          positive: 'Veri bekleniyor...',
          negative: 'Veri bekleniyor...',
          neutral: 'Piyasa izleniyor.'
        },
        globalInsight: 'Veri hattı temizleniyor, lütfen birazdan tekrar deneyin.'
      };
    }

    const posCount = comments.filter(c => c.sentiment === 'Positive').length;
    const negCount = comments.filter(c => c.sentiment === 'Negative').length;
    const total = comments.length;

    // Pick the most liked recent comment to make it feel fresh
    const topComment = [...comments].sort((a,b) => (b.likes || 0) - (a.likes || 0))[0]?.text || '';

    let sentiment = 'Neutral';
    let score = 50;

    if (posCount > negCount * 1.2) {
      sentiment = 'Positive';
      score = 65 + Math.min(Math.round((posCount/total) * 30), 30);
    } else if (negCount > posCount * 1.2) {
      sentiment = 'Negative';
      score = 35 - Math.min(Math.round((negCount/total) * 30), 30);
    }

    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return {
      sentiment,
      pulseScore: score,
      mainSummary: `${timeStr} itibarıyla ${assetName} üzerinde ${sentiment === 'Positive' ? 'pozitif bir rüzgar' : sentiment === 'Negative' ? 'satış baskısı' : 'belirsiz bir seyir'} hakim.`,
      summary: {
        positive: posCount > 0 ? `${posCount} kullanıcı yükseliş yönlü görüş bildirdi. Öne çıkan: "${topComment.substring(0, 60)}..."` : 'Şu an belirgin bir pozitif sinyal yok.',
        negative: negCount > 0 ? `${negCount} kullanıcı düşüş veya risk uyarısı paylaştı.` : 'Ciddi bir satış baskısı verisi yok.',
        neutral: 'Piyasa genel olarak bir tetikleyici bekliyor.'
      },
      globalInsight: `Son kazınan ${total} yorum analize göre; piyasa ${currentPrice} seviyesindeki ${assetName} için ${sentiment.toLowerCase()} bir duruş sergiliyor.`
    };
  }
};
