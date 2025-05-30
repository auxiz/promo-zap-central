
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

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Unauthorized')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Verificar se o usuário é admin
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || userRole?.role !== 'admin') {
      throw new Error('Access denied - Admin required')
    }

    console.log('Admin user accessing user management:', user.email)

    // Buscar todos os perfis de usuários
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    // Buscar todas as roles de usuários
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')

    if (rolesError) throw rolesError

    // Buscar usuários do auth (usando service role key)
    const { data: authUsers, error: authError2 } = await supabase.auth.admin.listUsers()
    
    if (authError2) {
      console.error('Failed to fetch auth users:', authError2)
    }

    // Combinar dados
    const usersWithData = profiles?.map(profile => {
      const userRole = roles?.find(r => r.user_id === profile.id)
      const authUser = authUsers?.users?.find(u => u.id === profile.id)
      
      return {
        id: profile.id,
        email: authUser?.email || 'N/A',
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        role: userRole?.role || 'user',
        last_sign_in_at: authUser?.last_sign_in_at,
        email_confirmed_at: authUser?.email_confirmed_at
      }
    }) || []

    // Buscar estatísticas
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    const { count: adminCount } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')

    const { count: activeInstances } = await supabase
      .from('user_whatsapp_instances')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Log da operação
    await supabase.from('system_logs').insert({
      level: 'info',
      message: 'Admin accessed user management',
      source: 'admin-users',
      user_id: user.id,
      context: {
        totalUsers,
        adminCount,
        activeInstances
      }
    })

    return new Response(JSON.stringify({
      users: usersWithData,
      stats: {
        totalUsers: totalUsers || 0,
        adminCount: adminCount || 0,
        activeInstances: activeInstances || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Admin users fetch failed:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: error.message === 'Unauthorized' || error.message === 'Invalid token' ? 401 : 
               error.message === 'Access denied - Admin required' ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
