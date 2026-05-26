import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kbgwexikgnnbptoybgjc.supabase.co'
const supabaseKey = 'sb_publishable_SCMtsn8x_dA89MPdMIv5NQ_sYISNfqo'
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { error: mError } = await supabase
    .from('daily_metrics')
    .update({ date: '2026-05-25' })
    .eq('date', '2026-05-26');
    
  console.log('Metrics update:', mError ? mError : 'Success');

  const { data: leads } = await supabase.from('leads').select('*');
  if (leads) {
    for (const lead of leads) {
      if (lead.created_at.startsWith('2026-05-26')) {
        const newDate = lead.created_at.replace('2026-05-26', '2026-05-25');
        await supabase.from('leads').update({ created_at: newDate }).eq('id', lead.id);
      }
    }
    console.log('Leads updated');
  }
}

main()
