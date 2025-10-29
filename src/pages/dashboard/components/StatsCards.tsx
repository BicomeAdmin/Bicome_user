
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase-singleton';

interface StatsCardsProps {
  userId: string;
  currentProjectId: string;
  user?: any;
  selectedProject?: any;
}

interface UserStats {
  totalPoints: number;
  currentLevel: number;
  nextLevelPoints: number;
  currentLevelPoints: number;
  completedActivities: number;
  consecutiveDays: number;
  totalRedemptions: number;
  rank: number;
}

export default function StatsCards({ userId, currentProjectId, user, selectedProject }: StatsCardsProps) {
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 0,
    currentLevel: 1,
    nextLevelPoints: 100,
    currentLevelPoints: 0,
    completedActivities: 0,
    consecutiveDays: 0,
    totalRedemptions: 0,
    rank: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && currentProjectId) {
      fetchUserStats();
    }
  }, [userId, currentProjectId]);

  // 監聽積分更新事件
  useEffect(() => {
    const handlePointsUpdate = () => {
      fetchUserStats();
    };

    window.addEventListener('pointsUpdated', handlePointsUpdate);
    return () => window.removeEventListener('pointsUpdated', handlePointsUpdate);
  }, []);

  const fetchUserStats = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // 獲取用戶總積分
      let totalPoints = 0;
      
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('total_points')
          .eq('id', userId)
          .maybeSingle();

        if (userData) {
          totalPoints = userData.total_points || 0;
        }
      } catch (error) {
        console.log('獲取用戶積分失敗:', error);
      }

      // 如果沒有總積分，從專案積分計算
      if (totalPoints === 0 && currentProjectId) {
        try {
          const { data: userProject } = await supabase
            .from('user_projects')
            .select('total_points')
            .eq('user_id', userId)
            .eq('project_id', currentProjectId)
            .maybeSingle();

          if (userProject) {
            totalPoints = userProject.total_points || 0;
          }
        } catch (error) {
          console.log('獲取專案積分失敗:', error);
        }
      }

      // 獲取完成的活動數量
      let completedActivities = 0;
      try {
        const { data: activities } = await supabase
          .from('user_activities')
          .select('id')
          .eq('user_id', userId)
          .eq('project_id', currentProjectId);

        completedActivities = activities?.length || 0;
      } catch (error) {
        console.log('獲取活動數量失敗:', error);
      }

      // 計算連續簽到天數
      let consecutiveDays = 0;
      try {
        const { data: checkins } = await supabase
          .from('user_activities')
          .select('completed_at')
          .eq('user_id', userId)
          .eq('project_id', currentProjectId)
          .like('activity_id', '%daily-checkin%')
          .order('completed_at', { ascending: false })
          .limit(30);

        if (checkins && checkins.length > 0) {
          consecutiveDays = calculateConsecutiveDays(checkins.map(c => c.completed_at));
        }
      } catch (error) {
        console.log('獲取簽到記錄失敗:', error);
      }

      // 獲取兌換次數
      let totalRedemptions = 0;
      try {
        const { data: redemptions } = await supabase
          .from('user_redemptions')
          .select('id')
          .eq('user_id', userId)
          .eq('project_id', currentProjectId);

        totalRedemptions = redemptions?.length || 0;
      } catch (error) {
        console.log('獲取兌換記錄失敗:', error);
      }

      // 計算等級
      const { currentLevel, nextLevelPoints, currentLevelPoints } = calculateLevel(totalPoints);

      setStats({
        totalPoints,
        currentLevel,
        nextLevelPoints,
        currentLevelPoints,
        completedActivities,
        consecutiveDays,
        totalRedemptions,
        rank: Math.max(1, Math.floor(Math.random() * 100) + 1) // 模擬排名
      });
    } catch (error) {
      console.error('獲取統計數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateConsecutiveDays = (dates: string[]): number => {
    if (dates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let consecutive = 0;
    let currentDate = new Date(today);

    for (const dateStr of dates) {
      const checkDate = new Date(dateStr);
      checkDate.setHours(0, 0, 0, 0);
      
      if (checkDate.getTime() === currentDate.getTime()) {
        consecutive++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return consecutive;
  };

  const calculateLevel = (points: number) => {
    const level = Math.floor(points / 100) + 1;
    const currentLevelPoints = points % 100;
    const nextLevelPoints = 100;
    
    return {
      currentLevel: level,
      currentLevelPoints,
      nextLevelPoints
    };
  };

  const getLevelBadge = (level: number) => {
    if (level >= 10) return { name: '鑽石', color: 'from-blue-400 to-blue-600', icon: 'ri-diamond-line' };
    if (level >= 7) return { name: '黃金', color: 'from-yellow-400 to-yellow-600', icon: 'ri-award-line' };
    if (level >= 4) return { name: '白銀', color: 'from-gray-400 to-gray-600', icon: 'ri-medal-line' };
    return { name: '青銅', color: 'from-amber-600 to-amber-800', icon: 'ri-trophy-line' };
  };

  const levelBadge = getLevelBadge(stats.currentLevel);
  const progressPercentage = (stats.currentLevelPoints / stats.nextLevelPoints) * 100;

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* 等級進度卡片 - 突出顯示 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${levelBadge.color} rounded-2xl flex items-center justify-center shadow-lg`}>
              <i className={`${levelBadge.icon} text-white text-xl`}></i>
            </div>
            <div>
              <h3 className="text-lg font-bold">{levelBadge.name} 會員</h3>
              <p className="text-blue-100 text-sm">等級 {stats.currentLevel}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
            <div className="text-blue-100 text-sm">總積分</div>
          </div>
        </div>
        
        {/* 進度條 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>升級進度</span>
            <span>{stats.currentLevelPoints}/{stats.nextLevelPoints}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 統計卡片網格 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* 完成任務 */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="ri-task-line text-green-600 text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm">完成任務</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedActivities}</p>
            </div>
          </div>
        </div>

        {/* 連續簽到 */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <i className="ri-calendar-check-line text-orange-600 text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm">連續簽到</p>
              <p className="text-2xl font-bold text-gray-900">{stats.consecutiveDays}</p>
            </div>
          </div>
        </div>

        {/* 兌換次數 */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <i className="ri-gift-line text-purple-600 text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm">兌換次數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRedemptions}</p>
            </div>
          </div>
        </div>

        {/* 排名 */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <i className="ri-trophy-line text-yellow-600 text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm">當前排名</p>
              <p className="text-2xl font-bold text-gray-900">#{stats.rank}</p>
            </div>
          </div>
        </div>

        {/* 本週目標 */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="ri-target-line text-blue-600 text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm">本週目標</p>
              <p className="text-2xl font-bold text-gray-900">75%</p>
            </div>
          </div>
        </div>

        {/* 邀請朋友 */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <i className="ri-user-add-line text-pink-600 text-xl"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-600 text-sm">邀請朋友</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
