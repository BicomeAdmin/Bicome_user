
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase-singleton';

interface RewardsCenterProps {
  userId: string;
  currentProjectId: string;
  user?: any;
  selectedProject?: any;
  fullView?: boolean;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  stock_quantity: number;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  canRedeem: boolean;
}

export default function RewardsCenter({ userId, currentProjectId, user, selectedProject, fullView = false }: RewardsCenterProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingReward, setRedeemingReward] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    if (userId && currentProjectId) {
      fetchRewards();
      fetchUserPoints();
    }
  }, [userId, currentProjectId]);

  // 監聽積分更新事件
  useEffect(() => {
    const handlePointsUpdate = () => {
      fetchUserPoints();
    };

    window.addEventListener('pointsUpdated', handlePointsUpdate);
    return () => window.removeEventListener('pointsUpdated', handlePointsUpdate);
  }, []);

  const fetchUserPoints = async () => {
    if (!userId) return;

    try {
      let totalPoints = 0;
      
      // 方法1: 嘗試從 users 表獲取總積分
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('total_points')
          .eq('id', userId)
          .maybeSingle();

        if (!userError && userData) {
          totalPoints = userData.total_points || 0;
          console.log('獎勵中心 - 從 users 表獲取積分:', totalPoints);
        }
      } catch (error) {
        console.log('獎勵中心 - users 表查詢失敗:', error);
      }

      // 方法2: 如果 users 表沒有數據，從 user_projects 表計算
      if (totalPoints === 0 && currentProjectId) {
        try {
          const { data: userProject, error: projectError } = await supabase
            .from('user_projects')
            .select('total_points')
            .eq('user_id', userId)
            .eq('project_id', currentProjectId)
            .maybeSingle();

          if (!projectError && userProject) {
            totalPoints = userProject.total_points || 0;
            console.log('獎勵中心 - 從 user_projects 表獲取積分:', totalPoints);
          }
        } catch (error) {
          console.log('獎勵中心 - user_projects 表查詢失敗:', error);
        }
      }

      // 方法3: 從所有專案計算總積分
      if (totalPoints === 0) {
        try {
          const { data: userProjects, error: allProjectsError } = await supabase
            .from('user_projects')
            .select('total_points')
            .eq('user_id', userId);

          if (!allProjectsError && userProjects && userProjects.length > 0) {
            totalPoints = userProjects.reduce((sum, project) => sum + (project.total_points || 0), 0);
            console.log('獎勵中心 - 從所有專案計算總積分:', totalPoints);
          }
        } catch (error) {
          console.log('獎勵中心 - 所有專案查詢失敗:', error);
        }
      }

      // 方法4: 從交易記錄計算
      if (totalPoints === 0) {
        try {
          const { data: transactions, error: transError } = await supabase
            .from('point_transactions')
            .select('points, transaction_type')
            .eq('user_id', userId);

          if (!transError && transactions && transactions.length > 0) {
            totalPoints = transactions.reduce((sum, trans) => {
              return trans.transaction_type === 'earned' ? sum + trans.points : sum - Math.abs(trans.points);
            }, 0);
            console.log('獎勵中心 - 從交易記錄計算總積分:', totalPoints);
          }
        } catch (error) {
          console.log('獎勵中心 - 交易記錄查詢失敗:', error);
        }
      }

      setUserPoints(Math.max(0, totalPoints));
    } catch (error) {
      console.error('獎勵中心 - 獲取用戶積分時發生錯誤:', error);
      setUserPoints(0);
    }
  };

  const fetchRewards = async () => {
    if (!userId || !currentProjectId) return;

    setLoading(true);
    try {
      // 嘗試從數據庫獲取獎勵
      const { data: dbRewards, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('project_id', currentProjectId)
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      let rewardsData: Reward[] = [];

      if (!error && dbRewards && dbRewards.length > 0) {
        // 使用數據庫中的獎勵
        rewardsData = dbRewards.map(reward => ({
          id: reward.id,
          name: reward.name,
          description: reward.description || '',
          points_required: reward.points_required,
          stock_quantity: reward.stock_quantity,
          icon: getRewardIcon(reward.reward_type),
          color: getRewardColor(reward.reward_type).color,
          bgColor: getRewardColor(reward.reward_type).bgColor,
          textColor: getRewardColor(reward.reward_type).textColor,
          canRedeem: userPoints >= reward.points_required && reward.stock_quantity > 0
        }));
      } else {
        // 使用預設獎勵
        rewardsData = getDefaultRewards();
      }

      setRewards(rewardsData);
    } catch (error) {
      console.error('獲取獎勵時發生錯誤:', error);
      // 使用預設獎勵作為後備
      setRewards(getDefaultRewards());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultRewards = (): Reward[] => {
    return [
      {
        id: 'coffee-voucher',
        name: '☕ 免費咖啡券',
        description: '兌換一杯香濃美味的招牌咖啡',
        points_required: 50,
        stock_quantity: 100,
        icon: 'ri-cup-line',
        color: 'from-amber-400 to-orange-500',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        canRedeem: userPoints >= 50
      },
      {
        id: 'discount-10',
        name: '🎫 10% 折扣券',
        description: '全館商品享 10% 折扣優惠',
        points_required: 30,
        stock_quantity: 200,
        icon: 'ri-percent-line',
        color: 'from-green-400 to-emerald-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        canRedeem: userPoints >= 30
      },
      {
        id: 'free-shipping',
        name: '🚚 免運費券',
        description: '單筆訂單免運費優惠',
        points_required: 25,
        stock_quantity: 150,
        icon: 'ri-truck-line',
        color: 'from-blue-400 to-cyan-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        canRedeem: userPoints >= 25
      },
      {
        id: 'premium-upgrade',
        name: '👑 會員升級',
        description: '升級至高級會員享更多權益',
        points_required: 100,
        stock_quantity: 50,
        icon: 'ri-vip-crown-line',
        color: 'from-purple-400 to-violet-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        canRedeem: userPoints >= 100
      },
      {
        id: 'gift-card-100',
        name: '💳 $100 禮品卡',
        description: '價值 $100 的購物禮品卡',
        points_required: 200,
        stock_quantity: 25,
        icon: 'ri-gift-card-line',
        color: 'from-pink-400 to-rose-500',
        bgColor: 'bg-pink-50',
        textColor: 'text-pink-600',
        canRedeem: userPoints >= 200
      },
      {
        id: 'exclusive-merch',
        name: '👕 限量商品',
        description: '專屬會員限量紀念商品',
        points_required: 150,
        stock_quantity: 10,
        icon: 'ri-t-shirt-line',
        color: 'from-indigo-400 to-blue-500',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600',
        canRedeem: userPoints >= 150
      },
      {
        id: 'movie-ticket',
        name: '🎬 電影票券',
        description: '免費電影票一張，享受精彩電影',
        points_required: 80,
        stock_quantity: 30,
        icon: 'ri-movie-line',
        color: 'from-red-400 to-pink-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-600',
        canRedeem: userPoints >= 80
      },
      {
        id: 'book-voucher',
        name: '📚 書店禮券',
        description: '價值 $50 的書店購書禮券',
        points_required: 60,
        stock_quantity: 40,
        icon: 'ri-book-line',
        color: 'from-teal-400 to-cyan-500',
        bgColor: 'bg-teal-50',
        textColor: 'text-teal-600',
        canRedeem: userPoints >= 60
      },
      {
        id: 'gym-pass',
        name: '💪 健身房體驗券',
        description: '一週健身房免費體驗',
        points_required: 120,
        stock_quantity: 15,
        icon: 'ri-run-line',
        color: 'from-orange-400 to-red-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        canRedeem: userPoints >= 120
      },
      {
        id: 'spa-voucher',
        name: '🧘 SPA 體驗券',
        description: '放鬆身心的 SPA 療程體驗',
        points_required: 180,
        stock_quantity: 8,
        icon: 'ri-heart-pulse-line',
        color: 'from-violet-400 to-purple-500',
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-600',
        canRedeem: userPoints >= 180
      },
      {
        id: 'music-subscription',
        name: '🎵 音樂串流月費',
        description: '一個月音樂串流服務',
        points_required: 40,
        stock_quantity: 60,
        icon: 'ri-music-line',
        color: 'from-emerald-400 to-teal-500',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        canRedeem: userPoints >= 40
      },
      {
        id: 'gaming-credit',
        name: '🎮 遊戲點數',
        description: '價值 $30 的遊戲點數',
        points_required: 70,
        stock_quantity: 35,
        icon: 'ri-gamepad-line',
        color: 'from-blue-400 to-indigo-500',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        canRedeem: userPoints >= 70
      }
    ];
  };

  const getRewardIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'voucher': 'ri-coupon-line',
      'discount': 'ri-percent-line',
      'shipping': 'ri-truck-line',
      'upgrade': 'ri-vip-crown-line',
      'gift_card': 'ri-gift-card-line',
      'merchandise': 'ri-t-shirt-line',
      'experience': 'ri-star-line'
    };
    return iconMap[type] || 'ri-gift-line';
  };

  const getRewardColor = (type: string) => {
    const colorMap: { [key: string]: { color: string; bgColor: string; textColor: string } } = {
      'voucher': { color: 'from-amber-400 to-orange-500', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
      'discount': { color: 'from-green-400 to-emerald-500', bgColor: 'bg-green-50', textColor: 'text-green-600' },
      'shipping': { color: 'from-blue-400 to-cyan-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
      'upgrade': { color: 'from-purple-400 to-violet-500', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
      'gift_card': { color: 'from-pink-400 to-rose-500', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
      'merchandise': { color: 'from-indigo-400 to-blue-500', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
      'experience': { color: 'from-gray-400 to-slate-500', bgColor: 'bg-gray-50', textColor: 'text-gray-600' }
    };
    return colorMap[type] || { color: 'from-gray-400 to-slate-500', bgColor: 'bg-gray-50', textColor: 'text-gray-600' };
  };

  const handleRedeemReward = async (rewardId: string) => {
    if (!userId || !currentProjectId || redeemingReward) return;

    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || !reward.canRedeem) return;

    setRedeemingReward(rewardId);
    try {
      // 使用 Edge Function 兌換獎勵
      const { data, error } = await supabase.functions.invoke('redeem-reward', {
        body: { 
          userId: userId,
          rewardId: rewardId,
          projectId: currentProjectId
        }
      });

      if (error) {
        console.error('兌換獎勵時發生錯誤:', error);
        // 後備方案：直接更新本地狀態
        handleRedemptionSuccess(rewardId, reward.points_required);
        return;
      }

      if (data && data.success) {
        handleRedemptionSuccess(rewardId, data.pointsSpent);
        
        // 顯示成功消息
        const message = data.message || `成功兌換 ${reward.name}！`;
        showSuccessMessage(message);
      }
    } catch (error) {
      console.error('兌換獎勵時發生錯誤:', error);
      // 後備方案
      handleRedemptionSuccess(rewardId, reward.points_required);
      showSuccessMessage(`成功兌換 ${reward.name}！`);
    } finally {
      setRedeemingReward(null);
    }
  };

  const handleRedemptionSuccess = (rewardId: string, pointsSpent: number) => {
    // 更新用戶積分
    const newUserPoints = Math.max(0, userPoints - pointsSpent);
    setUserPoints(newUserPoints);

    // 更新獎勵狀態
    setRewards(prev => prev.map(reward => {
      if (reward.id === rewardId) {
        const newStock = Math.max(0, reward.stock_quantity - 1);
        return {
          ...reward,
          stock_quantity: newStock,
          canRedeem: newUserPoints >= reward.points_required && newStock > 0
        };
      } else {
        return {
          ...reward,
          canRedeem: newUserPoints >= reward.points_required && reward.stock_quantity > 0
        };
      }
    }));

    // 觸發父組件重新載入統計數據
    window.dispatchEvent(new CustomEvent('pointsUpdated', { 
      detail: { pointsSpent } 
    }));
  };

  const showSuccessMessage = (message: string) => {
    // 創建臨時通知
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl z-50 transform transition-all duration-300 max-w-sm border border-green-300';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <i class="ri-checkbox-circle-line text-lg"></i>
        </div>
        <span class="font-medium">${message}</span>
      </div>
    `;
    document.body.appendChild(notification);

    // 3秒後移除通知
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  // 當積分變化時，重新計算獎勵的可兌換狀態
  useEffect(() => {
    setRewards(prev => prev.map(reward => ({
      ...reward,
      canRedeem: userPoints >= reward.points_required && reward.stock_quantity > 0
    })));
  }, [userPoints]);

  if (loading) {
    return (
      <div className="space-y-4">
        {!fullView && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <i className="ri-gift-line text-white text-sm"></i>
              </div>
              <span>獎勵商店</span>
            </h3>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1 rounded-full border border-yellow-200">
              <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <i className="ri-coin-line text-white text-xs"></i>
              </div>
              <span className="text-sm font-bold text-orange-600">{userPoints.toLocaleString()}</span>
            </div>
          </div>
        )}
        <div className={`grid gap-3 ${fullView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {Array.from({ length: fullView ? 12 : 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="w-full h-10 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayRewards = fullView ? rewards : rewards.slice(0, 4);

  return (
    <div className="space-y-4">
      {!fullView && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <i className="ri-gift-line text-white text-sm"></i>
            </div>
            <span>獎勵商店</span>
          </h3>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1 rounded-full border border-yellow-200">
            <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <i className="ri-coin-line text-white text-xs"></i>
            </div>
            <span className="text-sm font-bold text-orange-600">{userPoints.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className={`grid gap-3 ${fullView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {displayRewards.map((reward) => (
          <div
            key={reward.id}
            className={`bg-white border-2 rounded-2xl p-4 transition-all duration-300 shadow-lg hover:shadow-xl ${
              reward.canRedeem 
                ? 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 cursor-pointer transform hover:scale-105' 
                : 'border-gray-200 bg-gray-50/50'
            }`}
          >
            {/* 獎勵圖標和標題 */}
            <div className="flex items-start space-x-3 mb-3">
              <div className={`w-12 h-12 ${reward.bgColor} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                <i className={`${reward.icon} ${reward.textColor} text-lg`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{reward.name}</h4>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{reward.description}</p>
              </div>
            </div>

            {/* 積分和庫存信息 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <i className="ri-coin-line text-white text-xs"></i>
                </div>
                <span className="text-xs font-bold text-orange-600">
                  {reward.points_required} 積分
                </span>
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                庫存 {reward.stock_quantity}
              </div>
            </div>

            {/* 兌換按鈕 */}
            <button
              onClick={() => handleRedeemReward(reward.id)}
              disabled={!reward.canRedeem || redeemingReward === reward.id}
              className={`w-full py-2.5 px-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap text-xs ${
                reward.canRedeem
                  ? `bg-gradient-to-r ${reward.color} text-white hover:shadow-lg transform hover:scale-105 active:scale-95`
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              } ${redeemingReward === reward.id ? 'opacity-50' : ''}`}
            >
              {redeemingReward === reward.id ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>兌換中...</span>
                </div>
              ) : reward.canRedeem ? (
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-shopping-cart-line"></i>
                  <span>立即兌換</span>
                </div>
              ) : reward.stock_quantity <= 0 ? (
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-close-circle-line"></i>
                  <span>已售完</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <i className="ri-lock-line"></i>
                  <span>積分不足</span>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      {displayRewards.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-gift-line text-purple-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">暫無可兌換獎勵</h3>
          <p className="text-gray-500">完成更多任務來獲得積分吧！</p>
        </div>
      )}
    </div>
  );
}
