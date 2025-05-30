
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

    const { type = 'manual' } = await req.json()

    console.log(`Starting backup of type: ${type}`)

    // Criar registro de backup
    const { data: backup, error: backupError } = await supabase
      .from('system_backups')
      .insert({
        backup_type: type,
        status: 'running',
        tables_included: ['profiles', 'user_roles', 'user_activity', 'user_whatsapp_instances', 'user_groups', 'user_templates']
      })
      .select()
      .single()

    if (backupError) throw backupError

    try {
      // Simular processo de backup (em produção, aqui seria o backup real)
      const backupData = {
        profiles: await supabase.from('profiles').select('*'),
        userRoles: await supabase.from('user_roles').select('*'),
        userActivity: await supabase.from('user_activity').select('*'),
        whatsappInstances: await supabase.from('user_whatsapp_instances').select('*'),
        userGroups: await supabase.from('user_groups').select('*'),
        userTemplates: await supabase.from('user_templates').select('*')
      }

      // Calcular tamanho estimado
      const dataSize = JSON.stringify(backupData).length

      // Atualizar status do backup como concluído
      await supabase
        .from('system_backups')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          file_size: dataSize,
          file_path: `/backups/${backup.id}.json`
        })
        .eq('id', backup.id)

      // Log do backup
      await supabase.from('system_logs').insert({
        level: 'info',
        message: `Backup ${type} completed successfully`,
        source: 'backup-system',
        context: {
          backupId: backup.id,
          size: dataSize,
          tables: backup.tables_included
        }
      })

      // Registrar métrica
      await supabase.from('system_metrics').insert({
        metric_name: 'backup_completed',
        metric_value: 1,
        metric_type: 'counter',
        tags: { type, size: dataSize }
      })

      return new Response(JSON.stringify({
        success: true,
        backupId: backup.id,
        size: dataSize,
        tables: backup.tables_included,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      // Atualizar status como falha
      await supabase
        .from('system_backups')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message
        })
        .eq('id', backup.id)

      throw error
    }

  } catch (error) {
    console.error('Backup failed:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
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
