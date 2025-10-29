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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const requestData = await req.json()
    const { userId, projectId } = requestData

    if (!userId || !projectId) {
      return new Response(
        JSON.stringify({ 
          totalPoints: 0,
          level: 'Bronze',
          completedActivities: 0,
          availableRewards: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    
    if (!uuidRegex.test(userId) || !uuidRegex.test(projectId)) {
      return new Response(
        JSON.stringify({ 
          totalPoints: 0,
          level: 'Bronze',
          completedActivities: 0,
          availableRewards: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 獲取用戶專案積分
    const { data: userProject } = await supabaseClient
      .from('user_projects')
      .select('total_points, level_tier, current_level')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .maybeSingle()

    const totalPoints = userProject?.total_points || 0
    const level = userProject?.current_level || userProject?.level_tier || 'Bronze'

    // 獲取完成的活動數量（該專案）
    const { count: completedActivities } = await supabaseClient
      .from('user_activities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('project_id', projectId)

    // 獲取可用獎勵數量（該專案）
    const { count: availableRewards } = await supabaseClient
      .from('rewards')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .lte('points_required', totalPoints)
      .eq('is_active', true)

    console.log(`用戶 ${userId} 專案 ${projectId} 統計：積分=${totalPoints}, 活動=${completedActivities}, 獎勵=${availableRewards}`)

    return new Response(
      JSON.stringify({
        totalPoints,
        level,
        completedActivities: completedActivities || 0,
        availableRewards: availableRewards || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('函數執行錯誤:', error)
    return new Response(
      JSON.stringify({ 
        totalPoints: 0,
        level: 'Bronze',
        completedActivities: 0,
        availableRewards: 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})