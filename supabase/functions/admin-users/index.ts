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

    // Handle GET request - fetch users
    if (req.method === 'GET') {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')

      if (rolesError) throw rolesError

      const { data: authUsers, error: authError2 } = await supabase.auth.admin.listUsers()
      
      if (authError2) {
        console.error('Failed to fetch auth users:', authError2)
      }

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
    }

    // Handle POST request - update user role
    if (req.method === 'POST') {
      const { action, userId, newRole } = await req.json()

      if (action === 'updateRole') {
        // Verificar se não é o próprio usuário tentando alterar seu próprio role
        if (userId === user.id) {
          throw new Error('Cannot modify your own role')
        }

        // Verificar se não está tentando remover o último admin
        if (newRole === 'user') {
          const { count: adminCount } = await supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'admin')

          if (adminCount && adminCount <= 1) {
            throw new Error('Cannot remove the last administrator')
          }
        }

        const { error: updateError } = await supabase
          .from('user_roles')
          .upsert({ 
            user_id: userId, 
            role: newRole 
          }, { 
            onConflict: 'user_id' 
          })

        if (updateError) throw updateError

        // Log da operação
        await supabase.from('system_logs').insert({
          level: 'info',
          message: `User role updated: ${newRole}`,
          source: 'admin-users',
          user_id: user.id,
          context: {
            targetUserId: userId,
            newRole,
            action: 'updateRole'
          }
        })

        return new Response(JSON.stringify({
          success: true,
          message: `User role updated to ${newRole}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      throw new Error('Invalid action')
    }

    // Handle DELETE request - delete user
    if (req.method === 'DELETE') {
      const { userId } = await req.json()

      // Verificar se não é o próprio usuário tentando se deletar
      if (userId === user.id) {
        throw new Error('Cannot delete your own account')
      }

      // Verificar se não está tentando deletar o último admin
      const { data: targetUserRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (targetUserRole?.role === 'admin') {
        const { count: adminCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin')

        if (adminCount && adminCount <= 1) {
          throw new Error('Cannot delete the last administrator')
        }
      }

      // Buscar dados do usuário antes de deletar para log
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      // Deletar dados relacionados nas tabelas do projeto
      const deleteOperations = [
        supabase.from('user_roles').delete().eq('user_id', userId),
        supabase.from('user_whatsapp_instances').delete().eq('user_id', userId),
        supabase.from('user_shopee_credentials').delete().eq('user_id', userId),
        supabase.from('user_templates').delete().eq('user_id', userId),
        supabase.from('user_groups').delete().eq('user_id', userId),
        supabase.from('user_activity').delete().eq('user_id', userId),
        supabase.from('profiles').delete().eq('id', userId)
      ]

      // Executar todas as operações de delete
      for (const operation of deleteOperations) {
        const { error } = await operation
        if (error) {
          console.error('Error deleting user data:', error)
          // Continue mesmo com erros para tentar deletar o máximo possível
        }
      }

      // Deletar usuário do auth (isso também remove referências devido ao CASCADE)
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId)
      
      if (authDeleteError) {
        console.error('Error deleting auth user:', authDeleteError)
        throw new Error('Failed to delete user from authentication system')
      }

      // Log da operação
      await supabase.from('system_logs').insert({
        level: 'warning',
        message: `User deleted by admin`,
        source: 'admin-users',
        user_id: user.id,
        context: {
          deletedUserId: userId,
          deletedUserName: userProfile?.full_name || 'Unknown',
          action: 'deleteUser'
        }
      })

      return new Response(JSON.stringify({
        success: true,
        message: 'User deleted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Method not allowed')

  } catch (error) {
    console.error('Admin users operation failed:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: error.message === 'Unauthorized' || error.message === 'Invalid token' ? 401 : 
               error.message === 'Access denied - Admin required' ? 403 : 
               error.message === 'Method not allowed' ? 405 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
