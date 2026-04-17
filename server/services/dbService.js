import pg from 'pg';
const { Pool } = pg;

// In-memory storage fallback
const memoryStore = {
  insights: new Map(),
  comments: []
};

let useMemoryDb = false;
let pool = null;

// PostgreSQL pool configuration
try {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'marketpulse',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test connection
  await pool.query('SELECT 1').catch(() => {
    console.log('PostgreSQL not available, using in-memory database');
    useMemoryDb = true;
    pool = null;
  });

} catch (error) {
  console.log('PostgreSQL initialization failed, using in-memory database');
  useMemoryDb = true;
  pool = null;
}

// Initialize database tables
export async function initDatabase() {
  if (useMemoryDb || !pool) {
    console.log('Using in-memory database (no persistence)');
    return;
  }
  
  const client = await pool.connect();
  try {
    // Market insights table
    await client.query(`
      CREATE TABLE IF NOT EXISTS market_insights (
        id SERIAL PRIMARY KEY,
        asset_id VARCHAR(50) NOT NULL,
        asset_name VARCHAR(100) NOT NULL,
        pulse_score INTEGER NOT NULL,
        sentiment VARCHAR(20) NOT NULL,
        ai_summary TEXT,
        bullish_count INTEGER DEFAULT 0,
        bearish_count INTEGER DEFAULT 0,
        neutral_count INTEGER DEFAULT 0,
        total_comments INTEGER DEFAULT 0,
        sources JSONB,
        fetched_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(asset_id)
      )
    `);

    // Comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        asset_id VARCHAR(50) NOT NULL,
        external_id VARCHAR(100) NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        sentiment VARCHAR(20) NOT NULL,
        source VARCHAR(50) NOT NULL,
        likes INTEGER DEFAULT 0,
        timestamp TIMESTAMP NOT NULL,
        url TEXT,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(asset_id, external_id)
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_asset_id ON comments(asset_id);
      CREATE INDEX IF NOT EXISTS idx_comments_source ON comments(source);
      CREATE INDEX IF NOT EXISTS idx_comments_timestamp ON comments(timestamp DESC);
    `);

    console.log('Database initialized');
  } finally {
    client.release();
  }
}

export const dbService = {
  // Save market insight
  async saveInsight(insight) {
    // Memory fallback
    if (useMemoryDb || !pool) {
      memoryStore.insights.set(insight.assetId, {
        ...insight,
        savedAt: Date.now()
      });
      for (const comment of insight.comments) {
        memoryStore.comments.push({
          asset_id: insight.assetId,
          ...comment
        });
      }
      return true;
    }
    
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO market_insights 
        (asset_id, asset_name, pulse_score, sentiment, ai_summary, 
         bullish_count, bearish_count, neutral_count, total_comments, sources, fetched_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, to_timestamp($11 / 1000))
        ON CONFLICT (asset_id) 
        DO UPDATE SET
          asset_name = EXCLUDED.asset_name,
          pulse_score = EXCLUDED.pulse_score,
          sentiment = EXCLUDED.sentiment,
          ai_summary = EXCLUDED.ai_summary,
          bullish_count = EXCLUDED.bullish_count,
          bearish_count = EXCLUDED.bearish_count,
          neutral_count = EXCLUDED.neutral_count,
          total_comments = EXCLUDED.total_comments,
          sources = EXCLUDED.sources,
          fetched_at = EXCLUDED.fetched_at
      `, [
        insight.assetId,
        insight.assetName,
        insight.pulseScore,
        insight.sentiment,
        insight.aiSummary,
        insight.categoryStats.bullish.count,
        insight.categoryStats.bearish.count,
        insight.categoryStats.neutral.count,
        insight.comments.length,
        JSON.stringify(insight.sources),
        insight.fetchedAt
      ]);

      // Save comments
      for (const comment of insight.comments) {
        await client.query(`
          INSERT INTO comments 
          (asset_id, external_id, user_name, text, sentiment, source, likes, timestamp, url, verified)
          VALUES ($1, $2, $3, $4, $5, $6, $7, to_timestamp($8 / 1000), $9, $10)
          ON CONFLICT (asset_id, external_id) DO NOTHING
        `, [
          insight.assetId,
          comment.id,
          comment.user,
          comment.text,
          comment.sentiment,
          comment.source,
          comment.likes || 0,
          comment.timestamp,
          comment.url || null,
          comment.verified || false
        ]);
      }

      return true;
    } catch (error) {
      console.error('DB save error:', error.message);
      return false;
    } finally {
      client.release();
    }
  },

  // Get insight from database
  async getInsight(assetId, maxAgeHours = 2) {
    // Memory fallback
    if (useMemoryDb || !pool) {
      const insight = memoryStore.insights.get(assetId);
      if (!insight) return null;
      
      const maxAgeMs = maxAgeHours * 3600000;
      if (Date.now() - insight.fetchedAt > maxAgeMs) return null;
      
      const comments = memoryStore.comments
        .filter(c => c.asset_id === assetId)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);
      
      return {
        ...insight,
        comments,
        fromDatabase: false
      };
    }
    
    const client = await pool.connect();
    try {
      // Check if data is fresh enough
      const result = await client.query(`
        SELECT * FROM market_insights 
        WHERE asset_id = $1 
        AND fetched_at > NOW() - INTERVAL '${maxAgeHours} hours'
      `, [assetId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // Get recent comments
      const commentsResult = await client.query(`
        SELECT * FROM comments 
        WHERE asset_id = $1 
        ORDER BY timestamp DESC 
        LIMIT 50
      `, [assetId]);

      return {
        assetId: row.asset_id,
        assetName: row.asset_name,
        pulseScore: row.pulse_score,
        sentiment: row.sentiment,
        aiSummary: row.ai_summary,
        categoryStats: {
          bullish: { count: row.bullish_count },
          bearish: { count: row.bearish_count },
          neutral: { count: row.neutral_count }
        },
        comments: commentsResult.rows.map(c => ({
          id: c.external_id,
          user: c.user_name,
          text: c.text,
          sentiment: c.sentiment,
          source: c.source,
          likes: c.likes,
          timestamp: new Date(c.timestamp).getTime(),
          url: c.url,
          verified: c.verified
        })),
        sources: row.sources,
        fetchedAt: new Date(row.fetched_at).getTime(),
        fromDatabase: true
      };
    } catch (error) {
      console.error('DB get error:', error.message);
      return null;
    } finally {
      client.release();
    }
  },

  // Get all assets with stale data (for background jobs)
  async getStaleAssets(maxAgeHours = 2) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT DISTINCT asset_id, asset_name 
        FROM market_insights 
        WHERE fetched_at < NOW() - INTERVAL '${maxAgeHours} hours'
        OR fetched_at IS NULL
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },

  // Get popular assets
  async getPopularAssets(limit = 20) {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT asset_id, asset_name, pulse_score, sentiment, total_comments
        FROM market_insights
        ORDER BY total_comments DESC
        LIMIT $1
      `, [limit]);
      return result.rows;
    } finally {
      client.release();
    }
  }
};

export default dbService;
