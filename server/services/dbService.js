import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
let useMemoryStore = false;

// In-memory storage for local development when Supabase is unavailable.
const memoryDb = {
  insights: new Map(),
  comments: new Map()
};

function getInsightStorageKey(assetId, timeframe = '1D') {
  return `${assetId}:${timeframe || '1D'}`;
}

try {
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[DB] Supabase client initialized.');
} else {
    throw new Error('Missing or invalid credentials');
  }
} catch (e) {
  console.warn('[DB] Supabase connection failed, using in-memory storage:', e.message);
  useMemoryStore = true;
}

export async function initDatabase() {
  if (useMemoryStore) {
    console.log('[DB] Running with in-memory storage.');
    return Promise.resolve();
  }

  try {
    // Simple connection test
    const { error } = await supabase.from('market_insights').select('count', { count: 'exact', head: true }).limit(1);
    if (error) throw error;
    console.log('[DB] Supabase REST API connected and verified.');
  } catch (err) {
    console.error('[DB] Supabase verification failed, using in-memory storage:', err.message);
    useMemoryStore = true;
  }
  return Promise.resolve();
}

export const dbService = {
  // Save market insight
  async saveInsight(insight) {
    const storageKey = getInsightStorageKey(insight.assetId, insight.timeframe);
    if (useMemoryStore) {
      memoryDb.insights.set(storageKey, {
        ...insight,
        fetched_at: new Date(insight.fetchedAt).toISOString(),
        fromMemory: true
      });
      if (insight.comments) {
        memoryDb.comments.set(storageKey, insight.comments);
      }
      return true;
    }

    try {
      // 1. Upsert Insight
      const { error: insError } = await supabase
        .from('market_insights')
        .upsert({
          asset_id: storageKey,
          asset_name: insight.assetName,
          pulse_score: insight.pulseScore,
          sentiment: insight.sentiment,
          ai_summary: insight.aiSummary,
          category_summaries: insight.categorySummaries,
          bullish_count: insight.categoryStats.bullish.count,
          bearish_count: insight.categoryStats.bearish.count,
          neutral_count: insight.categoryStats.neutral.count,
          sources: insight.sources,
          fetched_at: new Date(insight.fetchedAt).toISOString()
        }, { onConflict: 'asset_id' });

      if (insError) throw insError;

      // 2. Insert Comments (Batch)
      if (insight.comments && insight.comments.length > 0) {
        const commentsToInsert = insight.comments.map(c => ({
          asset_id: storageKey,
          external_id: typeof c.id === 'string' ? c.id : String(c.id),
          user_name: c.user,
          text: c.text,
          sentiment: c.sentiment,
          source: c.source,
          likes: c.likes || 0,
          timestamp: new Date(c.timestamp).toISOString()
        }));

        const { error: commError } = await supabase
          .from('comments')
          .upsert(commentsToInsert, { onConflict: 'asset_id,external_id' });

        if (commError) console.warn('[DB] Comment batch upsert warning:', commError.message);
      }

      return true;
    } catch (error) {
      console.error('[DB Save Error]:', error.message);
      return false;
    }
  },

  // Get insight
  async getInsight(assetId, timeframe = '1D', maxAgeHours = 2) {
    const storageKey = getInsightStorageKey(assetId, timeframe);
    if (useMemoryStore) {
      const data = memoryDb.insights.get(storageKey);
      if (!data) return null;

      const age = (Date.now() - new Date(data.fetched_at).getTime()) / 3600000;
      if (age > maxAgeHours) return null;

      return {
        ...data,
        comments: memoryDb.comments.get(storageKey) || [],
        fromDatabase: true,
        isMemoryFallback: true
      };
    }

    try {
      const { data, error } = await supabase
        .from('market_insights')
        .select('*')
        .eq('asset_id', storageKey)
        .gt('fetched_at', new Date(Date.now() - maxAgeHours * 3600000).toISOString())
        .maybeSingle();

      if (error || !data) return null;

      const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .eq('asset_id', storageKey)
        .order('timestamp', { ascending: false })
        .limit(50);

      return {
        assetId,
        assetName: data.asset_name,
        timeframe,
        pulseScore: data.pulse_score,
        sentiment: data.sentiment,
        aiSummary: data.ai_summary,
        categorySummaries: data.category_summaries,
        categoryStats: {
          bullish: { count: data.bullish_count },
          bearish: { count: data.bearish_count },
          neutral: { count: data.neutral_count }
        },
        comments: (comments || []).map(c => ({
          id: c.external_id,
          user: c.user_name,
          text: c.text,
          sentiment: c.sentiment,
          source: c.source,
          likes: c.likes,
          timestamp: new Date(c.timestamp).getTime()
        })),
        sources: data.sources,
        fetchedAt: new Date(data.fetched_at).getTime(),
        fromDatabase: true
      };
    } catch (error) {
      console.error('[DB Get Error]:', error.message);
      return null;
    }
  }
};

export default dbService;
