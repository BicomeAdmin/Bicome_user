
import { useState, useEffect } from 'react';

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    totalRewards: number;
    totalActivities: number;
    totalPointsDistributed: number;
  };
}

export default function AdminStats({ stats }: AdminStatsProps) {
  const [animatedStats, setAnimatedStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    totalRewards: 0,
    totalActivities: 0,
    totalPointsDistributed: 0
  });

  useEffect(() => {
    // 數字動畫效果
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      
      // 使用緩動函數讓動畫更自然
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setAnimatedStats({
        totalUsers: Math.floor(stats.totalUsers * easeOutQuart),
        activeUsers: Math.floor(stats.activeUsers * easeOutQuart),
        totalProjects: Math.floor(stats.totalProjects * easeOutQuart),
        totalRewards: Math.floor(stats.totalRewards * easeOutQuart),
        totalActivities: Math.floor(stats.totalActivities * easeOutQuart),
        totalPointsDistributed: Math.floor(stats.totalPointsDistributed * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(stats);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [stats]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const statCards = [
    {
      title: '總用戶數',
      value: animatedStats.totalUsers,
      icon: 'ri-user-line',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      iconBg: 'from-blue-400 to-blue-500',
      change: '+12.5%',
      changeType: 'increase',
      description: '平台註冊用戶總數'
    },
    {
      title: '活躍用戶',
      value: animatedStats.activeUsers,
      icon: 'ri-user-star-line',
      color: 'green',
      bgGradient: 'from-green-500 to-green-600',
      iconBg: 'from-green-400 to-green-500',
      change: '+8.2%',
      changeType: 'increase',
      description: '近30天活躍用戶'
    },
    {
      title: '專案數量',
      value: animatedStats.totalProjects,
      icon: 'ri-folder-line',
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600',
      iconBg: 'from-purple-400 to-purple-500',
      change: '+2',
      changeType: 'increase',
      description: '正在運行的專案'
    },
    {
      title: '可用獎勵',
      value: animatedStats.totalRewards,
      icon: 'ri-gift-line',
      color: 'orange',
      bgGradient: 'from-orange-500 to-orange-600',
      iconBg: 'from-orange-400 to-orange-500',
      change: '+5',
      changeType: 'increase',
      description: '當前專案可兌換獎勵'
    },
    {
      title: '活動數量',
      value: animatedStats.totalActivities,
      icon: 'ri-calendar-event-line',
      color: 'pink',
      bgGradient: 'from-pink-500 to-pink-600',
      iconBg: 'from-pink-400 to-pink-500',
      change: '+3',
      changeType: 'increase',
      description: '當前專案進行中活動'
    },
    {
      title: '累計積分',
      value: animatedStats.totalPointsDistributed,
      icon: 'ri-coins-line',
      color: 'yellow',
      bgGradient: 'from-yellow-500 to-yellow-600',
      iconBg: 'from-yellow-400 to-yellow-500',
      change: '+15.8%',
      changeType: 'increase',
      description: '用戶累計獲得積分'
    }
  ];

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group"
            style={{ 
              animationDelay: `${index * 150}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            {/* 漸變背景頭部 */}
            <div className={`bg-gradient-to-r ${card.bgGradient} p-6 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white/80 text-sm font-medium mb-1">{card.title}</p>
                  <p className="text-white text-3xl font-bold mb-2">
                    {formatNumber(card.value)}
                  </p>
                  <p className="text-white/70 text-xs">{card.description}</p>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-r ${card.iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`${card.icon} text-2xl text-white`}></i>
                </div>
              </div>
            </div>

            {/* 統計變化區域 */}
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    card.changeType === 'increase' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    <i className={`${
                      card.changeType === 'increase' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'
                    } mr-1`}></i>
                    {card.change}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">vs 上月</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    <span className="text-xs text-gray-600">實時更新</span>
                  </div>
                </div>
              </div>

              {/* 進度條 */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 bg-gradient-to-r ${card.bgGradient} rounded-full transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${Math.min((card.value / Math.max(...statCards.map(c => c.value))) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
