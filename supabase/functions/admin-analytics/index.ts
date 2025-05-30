
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

    const url = new URL(req.url)
    const timeframe = url.searchParams.get('timeframe') || '24h'

    // Calcular período baseado no timeframe
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case '1h':
        startDate.setHours(now.getHours() - 1)
        break
      case '24h':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setDate(now.getDate() - 1)
    }

    console.log(`Fetching analytics for timeframe: ${timeframe}, from: ${startDate.toISOString()}`)

    // Métricas principais
    const [
      { count: totalUsers },
      { count: totalInstances },
      { count: activeInstances },
      { count: totalGroups },
      { count: totalTemplates },
      { count: recentActivity }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('user_whatsapp_instances').select('*', { count: 'exact', head: true }),
      supabase.from('user_whatsapp_instances').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('user_groups').select('*', { count: 'exact', head: true }),
      supabase.from('user_templates').select('*', { count: 'exact', head: true }),
      supabase.from('user_activity').select('*', { count: 'exact', head: true }).gte('created_at', startDate.toISOString())
    ])

    // Métricas históricas do sistema
    const { data: metrics } = await supabase
      .from('system_metrics')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Atividade por dia
    const { data: dailyActivity } = await supabase
      .from('user_activity')
      .select('created_at, type')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Agrupar atividade por dia
    const activityByDay = dailyActivity?.reduce((acc, activity) => {
      const date = new Date(activity.created_at).toLocaleDateString('pt-BR')
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Logs de erro recentes
    const { data: errorLogs } = await supabase
      .from('system_logs')
      .select('*')
      .eq('level', 'error')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    // Performance stats
    const performanceStats = {
      instanceUtilization: totalInstances > 0 ? Math.round((activeInstances / totalInstances) * 100) : 0,
      averageGroupsPerUser: totalUsers > 0 ? Math.round(totalGroups / totalUsers) : 0,
      templatesAdoption: totalUsers > 0 ? Math.round((totalTemplates / totalUsers) * 100) : 0
    }

    // Inserir métricas de analytics
    await supabase.from('system_metrics').insert([
      { metric_name: 'analytics_request', metric_value: 1, metric_type: 'counter', tags: { timeframe } },
      { metric_name: 'performance_check', metric_value: performanceStats.instanceUtilization, metric_type: 'gauge' }
    ])

    const analyticsData = {
      overview: {
        totalUsers: totalUsers || 0,
        totalInstances: totalInstances || 0,
        activeInstances: activeInstances || 0,
        totalGroups: totalGroups || 0,
        totalTemplates: totalTemplates || 0,
        recentActivity: recentActivity || 0
      },
      performance: performanceStats,
      trends: {
        dailyActivity: activityByDay,
        timeframe
      },
      metrics: metrics || [],
      errors: errorLogs || [],
      lastUpdated: new Date().toISOString()
    }

    return new Response(JSON.stringify(analyticsData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Analytics fetch failed:', error)
    
    return new Response(
      JSON.stringify({
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
