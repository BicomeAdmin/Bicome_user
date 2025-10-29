import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 處理 CORS 預檢請求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 初始化 Supabase 客戶端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('缺少 Supabase 環境變數')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: '服務配置錯誤' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // 解析請求數據
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      console.error('JSON 解析錯誤:', parseError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: '請求格式錯誤' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { userId, activityId, projectId } = requestData

    console.log('收到完成活動請求:', { userId, activityId, projectId })

    // 驗證必要參數
    if (!userId || !activityId || !projectId) {
      console.error('缺少必要參數')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: '需要提供用戶ID、活動ID和專案ID' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 判斷活動類型
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const isUuidActivity = uuidRegex.test(activityId)
    
    let pointsEarned = 10
    let activityName = '預設活動'

    try {
      // 從數據庫獲取活動信息（如果是 UUID 格式）
      if (isUuidActivity) {
        console.log('查詢數據庫活動:', activityId)
        const { data: activity, error: activityError } = await supabaseClient
          .from('activities')
          .select('name, points')
          .eq('id', activityId)
          .eq('project_id', projectId)
          .eq('is_active', true)
          .maybeSingle()

        if (activityError) {
          console.error('查詢活動錯誤:', activityError)
        } else if (activity) {
          pointsEarned = activity.points || 10
          activityName = activity.name || '活動'
          console.log('找到數據庫活動:', activityName, pointsEarned)
        }
      } else {
        // 處理預設活動
        console.log('處理預設活動:', activityId)
        const activityType = activityId.includes('-') ? activityId.split('-').slice(1).join('-') : activityId
        
        const defaultActivities: { [key: string]: { name: string; points: number } } = {
          'daily-checkin': { name: '每日簽到', points: 10 },
          'share-social': { name: '分享到社群媒體', points: 15 },
          'complete-profile': { name: '完善個人資料', points: 20 },
          'first-purchase': { name: '首次購買', points: 50 },
          'review-product': { name: '撰寫商品評價', points: 25 },
          'refer-friend': { name: '推薦朋友', points: 30 },
          'watch-video': { name: '觀看教學影片', points: 12 },
          'join-community': { name: '加入社群', points: 18 },
          'feedback-survey': { name: '填寫意見調查', points: 22 },
          'newsletter-subscribe': { name: '訂閱電子報', points: 8 },
          'app-download': { name: '下載手機應用', points: 35 },
          'birthday-bonus': { name: '生日特別獎勵', points: 100 }
        }
        
        const defaultActivity = defaultActivities[activityType]
        if (defaultActivity) {
          pointsEarned = defaultActivity.points
          activityName = defaultActivity.name
          console.log('使用預設活動配置:', activityName, pointsEarned)
        }
      }

      // 檢查重複完成（數據庫活動）
      if (isUuidActivity) {
        console.log('檢查活動重複完成...')
        const { data: existing, error: checkError } = await supabaseClient
          .from('user_activities')
          .select('id')
          .eq('user_id', userId)
          .eq('activity_id', activityId)
          .eq('project_id', projectId)
          .maybeSingle()

        if (checkError) {
          console.error('檢查重複錯誤:', checkError)
        } else if (existing) {
          console.log('活動已完成過')
          return new Response(
            JSON.stringify({ 
              success: false,
              error: '您已經完成過此活動了',
              pointsEarned: 0
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }

      // 檢查每日簽到重複
      if (!isUuidActivity && activityId.includes('daily-checkin')) {
        console.log('檢查每日簽到重複...')
        const today = new Date().toISOString().split('T')[0]
        const { data: todayCheckin, error: checkinError } = await supabaseClient
          .from('user_activities')
          .select('id')
          .eq('user_id', userId)
          .eq('project_id', projectId)
          .like('activity_id', '%daily-checkin%')
          .gte('completed_at', `${today}T00:00:00`)
          .maybeSingle()

        if (checkinError) {
          console.error('檢查簽到錯誤:', checkinError)
        } else if (todayCheckin) {
          console.log('今日已簽到')
          return new Response(
            JSON.stringify({ 
              success: false,
              error: '您今天已經簽到過了',
              pointsEarned: 0
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }

      console.log('開始記錄活動完成...')

      // 1. 記錄活動完成
      const { error: insertError } = await supabaseClient
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_id: activityId,
          project_id: projectId,
          points_earned: pointsEarned,
          completed_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('記錄活動失敗:', insertError)
        return new Response(
          JSON.stringify({ 
            success: false,
            error: '記錄活動失敗，請稍後再試',
            details: insertError.message
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      console.log('✅ 活動記錄成功')

      // 2. 更新用戶總積分
      console.log('更新用戶總積分...')
      const { data: currentUser, error: getUserError } = await supabaseClient
        .from('users')
        .select('total_points')
        .eq('id', userId)
        .single()

      if (getUserError) {
        console.error('獲取用戶積分錯誤:', getUserError)
      }

      const currentPoints = currentUser?.total_points || 0
      const newTotalPoints = currentPoints + pointsEarned

      const { error: updateUserError } = await supabaseClient
        .from('users')
        .update({ total_points: newTotalPoints })
        .eq('id', userId)

      if (updateUserError) {
        console.error('更新用戶積分失敗:', updateUserError)
      } else {
        console.log(`✅ 用戶總積分更新: ${currentPoints} -> ${newTotalPoints}`)
      }

      // 3. 更新專案積分
      console.log('更新專案積分...')
      const { data: userProject, error: getProjectError } = await supabaseClient
        .from('user_projects')
        .select('total_points')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .maybeSingle()

      if (getProjectError) {
        console.error('獲取專案積分錯誤:', getProjectError)
      }

      const projectPoints = userProject?.total_points || 0
      const newProjectPoints = projectPoints + pointsEarned

      const { error: upsertError } = await supabaseClient
        .from('user_projects')
        .upsert({
          user_id: userId,
          project_id: projectId,
          total_points: newProjectPoints,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,project_id'
        })

      if (upsertError) {
        console.error('更新專案積分失敗:', upsertError)
      } else {
        console.log(`✅ 專案積分更新: ${projectPoints} -> ${newProjectPoints}`)
      }

      // 4. 記錄積分交易
      console.log('記錄積分交易...')
      const { error: transactionError } = await supabaseClient
        .from('point_transactions')
        .insert({
          user_id: userId,
          project_id: projectId,
          transaction_type: 'earned',
          points: pointsEarned,
          description: `完成活動：${activityName}`,
          created_at: new Date().toISOString()
        })

      if (transactionError) {
        console.error('記錄積分交易失敗:', transactionError)
      } else {
        console.log('✅ 積分交易記錄成功')
      }

      console.log(`🎉 活動完成成功！用戶 ${userId} 獲得 ${pointsEarned} 積分`)

      // 返回成功響應
      return new Response(
        JSON.stringify({ 
          success: true, 
          pointsEarned,
          activityName,
          newTotalPoints: newProjectPoints,
          message: `恭喜！您完成了「${activityName}」，獲得 ${pointsEarned} 積分！`
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (dbError: any) {
      console.error('數據庫操作錯誤:', dbError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: '數據庫操作失敗，請稍後再試',
          details: dbError?.message || '未知錯誤'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error: any) {
    console.error('函數執行錯誤:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: '系統錯誤，請稍後再試',
        details: error?.message || '未知錯誤'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})