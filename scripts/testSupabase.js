import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ URL or Key missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('🔍 Supabase API Baglantisi Test Ediliyor...');
  const { data, error } = await supabase.from('market_insights').select('count', { count: 'exact', head: true });

  if (error) {
    console.error('❌ API HATASI:', error.message);
    if (error.message.includes('relation "public.market_insights" does not exist')) {
      console.log('✅ API BAGLANTISI BASARILI! (Sadece tablolar henüz kurulmamış).');
      console.log('👉 Yani sorun sadece o uzun postgresql://... linkinde!');
    }
  } else {
    console.log('✅ BAGLANTI VE TABLOLAR TAMAM!');
  }
}

test();
