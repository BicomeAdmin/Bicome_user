
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase-singleton';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface ActivityListProps {
  userId: string;
  currentProjectId: string;
  user?: User;
  selectedProject?: Project;
  fullView?: boolean;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  completed?: boolean;
  canComplete?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  estimatedTime?: string;
}

export default function ActivityList({ userId, currentProjectId, user, selectedProject, fullView = false }: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingActivity, setCompletingActivity] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (user && selectedProject) {
      fetchActivities();
    }
  }, [user, selectedProject]);

  // 監聽積分更新事件
  useEffect(() => {
    const handlePointsUpdate = () => {
      fetchActivities();
    };
    window.addEventListener('pointsUpdated', handlePointsUpdate);
    return () => window.removeEventListener('pointsUpdated', handlePointsUpdate);
  }, [user, selectedProject]);

  const fetchActivities = async () => {
    if (!user || !selectedProject) return;

    setLoading(true);
    try {
      console.log(`載入活動 - 用戶: ${user.id}, 專案: ${selectedProject.id}`);
      
      // 從數據庫獲取該專案的活動
      const { data: dbActivities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('project_id', selectedProject.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      let activitiesData: Activity[] = [];

      if (!error && dbActivities && dbActivities.length > 0) {
        // 使用數據庫中的活動
        activitiesData = dbActivities.map(activity => ({
          id: activity.id,
          name: activity.name,
          description: activity.description || '',
          points: activity.points,
          icon: getActivityIcon(activity.activity_type),
          color: getActivityColor(activity.activity_type).color,
          bgColor: getActivityColor(activity.activity_type).bgColor,
          textColor: getActivityColor(activity.activity_type).textColor,
          completed: false,
          canComplete: true,
          difficulty: activity.difficulty_level || getDifficulty(activity.points),
          category: activity.category || activity.activity_type,
          estimatedTime: getEstimatedTime(activity.activity_type)
        }));

        console.log(`專案 ${selectedProject.name} 的活動數量：${activitiesData.length}`);
      } else {
        // 使用預設活動（每個專案獨立）
        activitiesData = getDefaultActivities(selectedProject.id);
        console.log(`專案 ${selectedProject.name} 使用預設活動`);
      }

      // 檢查用戶已完成的活動
      if (activitiesData.length > 0) {
        console.log(`檢查已完成活動 - 用戶: ${user.id}, 專案: ${selectedProject.id}`);
        
        const { data: userActivities, error: userActivitiesError } = await supabase
          .from('user_activities')
          .select('activity_id, completed_at')
          .eq('user_id', user.id)
          .eq('project_id', selectedProject.id);

        if (userActivitiesError) {
          console.error('查詢用戶活動錯誤:', userActivitiesError);
          // 如果查詢失敗，使用預設數據
          console.log('使用預設活動狀態');
        } else if (userActivities) {
          const completedActivityIds = new Set(userActivities.map(ua => ua.activity_id));
          const today = new Date().toISOString().split('T')[0];
          
          activitiesData = activitiesData.map(activity => {
            const isCompleted = completedActivityIds.has(activity.id);
            let canComplete = !isCompleted;

            // 檢查每日簽到限制
            if (activity.id.includes('daily-checkin') || activity.name === '每日簽到' || activity.category === 'daily') {
              const todayCheckin = userActivities.find(ua => 
                (ua.activity_id === activity.id || ua.activity_id.includes('daily-checkin')) && 
                ua.completed_at.startsWith(today)
              );
              canComplete = !todayCheckin;
            }

            return {
              ...activity,
              completed: isCompleted,
              canComplete
            };
          });
        }
      }

      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities(getDefaultActivities(selectedProject?.id || ''));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultActivities = (projectId: string): Activity[] => {
    // 為每個專案生成獨立的預設活動ID
    const projectPrefix = projectId.substring(0, 8);
    
    return [
      {
        id: `${projectPrefix}-daily-checkin`,
        name: '每日簽到',
        description: '每天登入系統即可獲得積分獎勵',
        points: 10,
        icon: 'ri-calendar-check-line',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        completed: false,
        canComplete: true,
        difficulty: 'easy',
        category: 'daily',
        estimatedTime: '1 分鐘'
      },
      {
        id: `${projectPrefix}-share-social`,
        name: '分享到社群媒體',
        description: '分享內容到社群媒體平台',
        points: 15,
        icon: 'ri-share-line',
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        completed: false,
        canComplete: true,
        difficulty: 'easy',
        category: 'social',
        estimatedTime: '2 分鐘'
      },
      {
        id: `${projectPrefix}-complete-profile`,
        name: '完善個人資料',
        description: '完整填寫個人資料信息',
        points: 20,
        icon: 'ri-user-settings-line',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        completed: false,
        canComplete: true,
        difficulty: 'medium',
        category: 'profile',
        estimatedTime: '5 分鐘'
      },
      {
        id: `${projectPrefix}-first-purchase`,
        name: '首次購買',
        description: '完成您的第一次購買',
        points: 50,
        icon: 'ri-shopping-cart-line',
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        completed: false,
        canComplete: true,
        difficulty: 'hard',
        category: 'purchase',
        estimatedTime: '10 分鐘'
      },
      {
        id: `${projectPrefix}-review-product`,
        name: '撰寫商品評價',
        description: '為購買的商品撰寫評價',
        points: 25,
        icon: 'ri-star-line',
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-600',
        completed: false,
        canComplete: true,
        difficulty: 'medium',
        category: 'review',
        estimatedTime: '3 分鐘'
      },
      {
        id: `${projectPrefix}-refer-friend`,
        name: '推薦朋友',
        description: '邀請朋友加入會員計劃',
        points: 30,
        icon: 'ri-user-add-line',
        color: 'from-pink-500 to-pink-600',
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-600',
        completed: false,
        canComplete: true,
        difficulty: 'medium',
        category: 'referral',
        estimatedTime: '5 分鐘'
      },
      {
        id: `${projectPrefix}-watch-video`,
        name: '觀看教學影片',
        description: '觀看完整的產品介紹影片',
        points: 12,
        icon: 'ri-play-circle-line',
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        completed: false,
        canComplete: true,
        difficulty: 'easy',
        category: 'learning',
        estimatedTime: '8 分鐘'
      },
      {
        id: `${projectPrefix}-join-community`,
        name: '加入社群',
        description: '加入官方社群群組',
        points: 18,
        icon: 'ri-team-line',
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600',
        completed: false,
        canComplete: true,
        difficulty: 'easy',
        category: 'social',
        estimatedTime: '3 分鐘'
      },
      {
        id: `${projectPrefix}-feedback-survey`,
        name: '填寫意見調查',
        description: '協助我們改善產品體驗',
        points: 22,
        icon: 'ri-questionnaire-line',
        color: 'from-teal-500 to-teal-600',
        bgColor: 'bg-teal-50',
        textColor: 'text-teal-600',
        completed: false,
        canComplete: true,
        difficulty: 'medium',
        category: 'feedback',
        estimatedTime: '6 分鐘'
      },
      {
        id: `${projectPrefix}-newsletter-subscribe`,
        name: '訂閱電子報',
        description: '訂閱最新消息和優惠資訊',
        points: 8,
        icon: 'ri-mail-line',
        color: 'from-cyan-500 to-cyan-600',
        bgColor: 'bg-cyan-50',
        textColor: 'text-cyan-600',
        completed: false,
        canComplete: true,
        difficulty: 'easy',
        category: 'subscription',
        estimatedTime: '2 分鐘'
      },
      {
        id: `${projectPrefix}-app-download`,
        name: '下載手機應用',
        description: '下載並安裝官方手機應用',
        points: 35,
        icon: 'ri-smartphone-line',
        color: 'from-violet-500 to-violet-600',
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-600',
        completed: false,
        canComplete: true,
        difficulty: 'medium',
        category: 'app',
        estimatedTime: '7 分鐘'
      },
      {
        id: `${projectPrefix}-birthday-bonus`,
        name: '生日特別獎勵',
        description: '在生日當月領取特別積分',
        points: 100,
        icon: 'ri-cake-3-line',
        color: 'from-rose-500 to-rose-600',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-600',
        completed: false,
        canComplete: true,
        difficulty: 'easy',
        category: 'special',
        estimatedTime: '1 分鐘'
      }
    ];
  };

  const getDifficulty = (points: number): 'easy' | 'medium' | 'hard' => {
    if (points <= 15) return 'easy';
    if (points <= 30) return 'medium';
    return 'hard';
  };

  const getEstimatedTime = (type: string): string => {
    const timeMap: { [key: string]: string } = {
      'daily_checkin': '1 分鐘',
      'social_share': '2 分鐘',
      'profile_completion': '5 分鐘',
      'purchase': '10 分鐘',
      'review': '3 分鐘',
      'referral': '5 分鐘'
    };
    return timeMap[type] || '3 分鐘';
  };

  const getActivityIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'daily_checkin': 'ri-calendar-check-line',
      'social_share': 'ri-share-line',
      'profile_completion': 'ri-user-settings-line',
      'purchase': 'ri-shopping-cart-line',
      'review': 'ri-star-line',
      'referral': 'ri-user-add-line',
      'survey': 'ri-questionnaire-line',
      'event': 'ri-calendar-event-line'
    };
    return iconMap[type] || 'ri-trophy-line';
  };

  const getActivityColor = (type: string) => {
    const colorMap: { [key: string]: { color: string; bgColor: string; textColor: string } } = {
      'daily_checkin': { color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
      'social_share': { color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-600' },
      'profile_completion': { color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
      'purchase': { color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
      'review': { color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
      'referral': { color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50', textColor: 'text-pink-600' }
    };
    return colorMap[type] || { color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50', textColor: 'text-gray-600' };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '簡單';
      case 'medium': return '中等';
      case 'hard': return '困難';
      default: return '普通';
    }
  };

  const handleCompleteActivity = async (activityId: string) => {
    if (!user || !selectedProject || completingActivity) return;

    const activity = activities.find(a => a.id === activityId);
    if (!activity || !activity.canComplete) return;

    setCompletingActivity(activityId);
    
    console.log('開始完成活動:', {
      activityId,
      activityName: activity.name,
      userId: user.id,
      projectId: selectedProject.id,
      points: activity.points
    });

    try {
      // 使用 Edge Function 完成活動
      const response = await supabase.functions.invoke('complete-activity', {
        body: { 
          userId: user.id,
          activityId: activityId,
          projectId: selectedProject.id
        }
      });

      console.log('Edge Function 回應:', response);

      if (response.error) {
        console.error('Edge Function 錯誤:', response.error);
        showErrorMessage('活動完成失敗，請稍後再試');
        setCompletingActivity(null);
        return;
      }

      const data = response.data;
      console.log('Edge Function 數據:', data);

      if (data && data.success) {
        console.log(`✅ 活動完成成功！獲得 ${data.pointsEarned} 積分`);
        
        // 更新活動狀態
        setActivities(prev => prev.map(a => 
          a.id === activityId 
            ? { ...a, completed: true, canComplete: false }
            : a
        ));

        // 顯示成功消息
        showSuccessMessage(data.message || `恭喜！您完成了「${activity.name}」，獲得 ${data.pointsEarned} 積分！`);
        
        // 觸發積分更新事件
        console.log('觸發積分更新事件');
        window.dispatchEvent(new CustomEvent('pointsUpdated', { 
          detail: { pointsEarned: data.pointsEarned } 
        }));
        
        // 延遲重新載入活動列表
        setTimeout(() => {
          fetchActivities();
        }, 500);
      } else {
        console.error('活動完成失敗:', data);
        showErrorMessage(data?.error || '活動完成失敗');
      }
    } catch (error) {
      console.error('活動完成異常:', error);
      showErrorMessage('系統錯誤，請稍後再試');
    } finally {
      setCompletingActivity(null);
    }
  };

  const showSuccessMessage = (message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 flex items-center space-x-2 max-w-sm';
    notification.innerHTML = `
      <i class="ri-checkbox-circle-line text-lg md:text-xl"></i>
      <span class="text-sm md:text-base">${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const showErrorMessage = (message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 flex items-center space-x-2 max-w-sm';
    notification.innerHTML = `
      <i class="ri-error-warning-line text-lg md:text-xl"></i>
      <span class="text-sm md:text-base">${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-3xl p-4 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const categories = [
    { id: 'all', name: '全部', icon: 'ri-apps-line' },
    { id: 'daily', name: '每日', icon: 'ri-calendar-line' },
    { id: 'social', name: '社交', icon: 'ri-share-line' },
    { id: 'profile', name: '個人', icon: 'ri-user-line' },
    { id: 'purchase', name: '購買', icon: 'ri-shopping-cart-line' },
    { id: 'learning', name: '學習', icon: 'ri-book-line' },
    { id: 'feedback', name: '反饋', icon: 'ri-feedback-line' },
    { id: 'special', name: '特別', icon: 'ri-star-line' }
  ];

  const filteredActivities = selectedCategory === 'all' 
    ? activities 
    : activities.filter(activity => activity.category === selectedCategory);

  const displayActivities = fullView || showAll ? filteredActivities : filteredActivities.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* 分類篩選 - 多鄰國風格 */}
      {fullView && (
        <div className="bg-white rounded-3xl p-4 shadow-lg">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className={`${category.icon} text-sm`}></i>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 任務標題 */}
      {!fullView && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">今日任務</h3>
          {activities.length > 3 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 text-sm font-medium"
            >
              {showAll ? '收起' : '查看全部'}
            </button>
          )}
        </div>
      )}

      {/* 任務列表 - 多鄰國風格 */}
      <div className="space-y-3">
        {displayActivities.map((activity) => (
          <div
            key={activity.id}
            className={`bg-white rounded-3xl p-4 shadow-lg border-2 transition-all duration-200 ${
              activity.completed 
                ? 'border-green-200 bg-green-50/50' 
                : 'border-gray-100 hover:border-blue-200 hover:shadow-xl'
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* 任務圖標 */}
              <div className={`w-14 h-14 ${activity.bgColor} rounded-2xl flex items-center justify-center relative`}>
                <i className={`${activity.icon} ${activity.textColor} text-xl`}></i>
                {activity.completed && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <i className="ri-check-line text-white text-xs"></i>
                  </div>
                )}
              </div>

              {/* 任務信息 */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-bold text-gray-900">{activity.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty || 'easy')}`}>
                    {getDifficultyText(activity.difficulty || 'easy')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <i className="ri-coin-line text-yellow-500"></i>
                    <span className="font-bold text-yellow-600">+{activity.points}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <i className="ri-time-line"></i>
                    <span>{activity.estimatedTime}</span>
                  </div>
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex flex-col items-center">
                {activity.completed ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <i className="ri-check-line text-lg"></i>
                    <span className="text-sm font-bold">完成</span>
                  </div>
                ) : activity.canComplete ? (
                  <button
                    onClick={() => handleCompleteActivity(activity.id)}
                    disabled={completingActivity === activity.id}
                    className={`px-6 py-3 bg-gradient-to-r ${activity.color} text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
                  >
                    {completingActivity === activity.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>處理中</span>
                      </div>
                    ) : (
                      '開始'
                    )}
                  </button>
                ) : (
                  <span className="text-sm text-gray-500 px-4 py-2 bg-gray-100 rounded-2xl">
                    暫不可用
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空狀態 */}
      {displayActivities.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-task-line text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">沒有可用任務</h3>
          <p className="text-gray-500">請稍後再來查看新任務</p>
        </div>
      )}
    </div>
  );
}
