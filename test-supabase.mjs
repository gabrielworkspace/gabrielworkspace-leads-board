import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://kbgwexikgnnbptoybgjc.supabase.co', 'sb_publishable_SCMtsn8x_dA89MPdMIv5NQ_sYISNfqo');

async function test() {
  const { data, error } = await supabase.from('daily_metrics').insert([{
    date: '2026-05-25',
    messagessent: 10,
    messagesreplied: 5,
    adspend: 100,
    lprevenue: 500
  }]).select();
  
  console.log('Insert Error:', error);
  console.log('Insert Data:', data);
  
  const { data: fetch, error: fetchErr } = await supabase.from('daily_metrics').select('*');
  console.log('Fetch Error:', fetchErr);
  console.log('Fetch Data:', fetch);
}

test();
