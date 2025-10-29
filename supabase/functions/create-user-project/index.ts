import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 使用 service_role key 來繞過 RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 獲取請求數據
    const { project_id, user_id } = await req.json()

    if (!project_id || !user_id) {
      return new Response(
        JSON.stringify({ error: '需要提供專案ID和用戶ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating user project relation:', { user_id, project_id })

    // 檢查用戶專案是否已存在
    const { data: existingUserProject } = await supabaseAdmin
      .from('user_projects')
      .select('id, total_points, level_tier, current_level')
      .eq('user_id', user_id)
      .eq('project_id', project_id)
      .maybeSingle()

    if (existingUserProject) {
      console.log('User project already exists:', existingUserProject)
      return new Response(
        JSON.stringify({ 
          success: true,
          data: existingUserProject,
          message: '用戶專案關聯已存在'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 獲取第一個等級
    const { data: firstTier } = await supabaseAdmin
      .from('level_tiers')
      .select('id, tier_name, min_points')
      .eq('project_id', project_id)
      .order('min_points', { ascending: true })
      .limit(1)
      .maybeSingle()

    const tierName = firstTier?.tier_name || 'Bronze'

    // 創建用戶專案記錄（使用 service_role 繞過 RLS）
    const { data: newUserProject, error: createError } = await supabaseAdmin
      .from('user_projects')
      .insert({
        user_id: user_id,
        project_id: project_id,
        total_points: 100,
        level_tier: tierName,
        current_level: 1,
        is_active: true,
        total_activities_completed: 0,
        total_points_earned: 0,
        total_points_spent: 0,
        joined_at: new Date().toISOString()
      })
      .select('id, total_points, level_tier, current_level')
      .single()

    if (createError) {
      console.error('Error creating user project:', createError)
      return new Response(
        JSON.stringify({ 
          error: '創建用戶專案關聯失敗',
          details: createError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Successfully created user project:', newUserProject)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: newUserProject,
        message: '成功創建用戶專案關聯'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: '伺服器錯誤',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})