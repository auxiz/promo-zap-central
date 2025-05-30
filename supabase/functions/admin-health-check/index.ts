
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting health check...')

    // Verificar conectividade do banco
    const { data: dbCheck, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (dbError) {
      console.error('Database check failed:', dbError)
      throw new Error('Database connection failed')
    }

    // Verificar tabelas críticas
    const tables = ['profiles', 'user_roles', 'user_activity', 'system_config']
    const tableChecks = await Promise.all(
      tables.map(async (table) => {
        try {
          const { error } = await supabase.from(table).select('count').limit(1)
          return { table, status: error ? 'error' : 'ok', error: error?.message }
        } catch (err) {
          return { table, status: 'error', error: err.message }
        }
      })
    )

    // Verificar configurações do sistema
    const { data: configs } = await supabase
      .from('system_config')
      .select('*')

    // Coletar métricas básicas
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: activeInstances } = await supabase
      .from('user_whatsapp_instances')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Inserir métricas no sistema
    await supabase.from('system_metrics').insert([
      { metric_name: 'total_users', metric_value: userCount || 0, metric_type: 'gauge' },
      { metric_name: 'active_instances', metric_value: activeInstances || 0, metric_type: 'gauge' },
      { metric_name: 'health_check_count', metric_value: 1, metric_type: 'counter' }
    ])

    // Log do health check
    await supabase.from('system_logs').insert({
      level: 'info',
      message: 'Health check completed successfully',
      source: 'health-check',
      context: {
        tables: tableChecks,
        metrics: { userCount, activeInstances }
      }
    })

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        tables: tableChecks
      },
      metrics: {
        totalUsers: userCount,
        activeInstances: activeInstances
      },
      config: configs,
      uptime: Date.now()
    }

    return new Response(JSON.stringify(healthData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
