import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const sql = `
-- 1. Market Insights Tablosu
CREATE TABLE IF NOT EXISTS market_insights (
    asset_id TEXT PRIMARY KEY,
    asset_name TEXT,
    pulse_score INTEGER,
    sentiment TEXT,
    ai_summary TEXT,
    category_summaries JSONB,
    bullish_count INTEGER DEFAULT 0,
    bearish_count INTEGER DEFAULT 0,
    neutral_count INTEGER DEFAULT 0,
    sources JSONB,
    fetched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Yorumlar Tablosu
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    asset_id TEXT REFERENCES market_insights(asset_id) ON DELETE CASCADE,
    external_id TEXT,
    user_name TEXT,
    text TEXT,
    sentiment TEXT,
    source TEXT,
    likes INTEGER DEFAULT 0,
    timestamp TIMESTAMPTZ,
    url TEXT,
    UNIQUE(asset_id, external_id)
);

-- 3. Indexler
CREATE INDEX IF NOT EXISTS idx_comments_asset ON comments(asset_id);
CREATE INDEX IF NOT EXISTS idx_insights_fetched ON market_insights(fetched_at DESC);
`;

async function setup() {
  console.log('🚀 Veritabanı Kurulum Sihirbazı (v2.1 - Ultra-Safe) Başlıyor...');

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ HATA: DATABASE_URL .env dosyasında bulunamadı.');
    process.exit(1);
  }

  // Force ignore cert issues for setup script
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  console.log('🔗 Güvenli kanal üzerinden bağlanılıyor...');

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Veritabanına sızıldı! Bağlantı başarılı.');

    console.log('⏳ Yapılar inşa ediliyor...');
    await client.query(sql);

    console.log('🎉 BRAVO! Veritabanı kurulumu %100 tamamlandı.');
  } catch (err) {
    console.error('❌ KURULUM HATASI:', err.message);
  } finally {
    await client.end();
  }
}

setup();
