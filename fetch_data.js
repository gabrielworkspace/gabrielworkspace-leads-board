import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kbgwexikgnnbptoybgjc.supabase.co'
const supabaseKey = 'sb_publishable_SCMtsn8x_dA89MPdMIv5NQ_sYISNfqo'
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data: metrics } = await supabase.from('daily_metrics').select('*')
  console.log('Metrics:', metrics)

  const { data: leads } = await supabase.from('leads').select('*')
  console.log('Leads:', leads)
}

main()
