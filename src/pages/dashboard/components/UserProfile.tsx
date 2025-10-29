
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  total_points: number;
  level: string;
  avatar_url?: string;
  streak_days?: number;
  weekly_goal?: number;
  weekly_progress?: number;
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export default function UserProfile({ user, onLogout }: UserProfileProps) {
  const [showSettings, setShowSettings] = useState(false);

  const achievements = [
    { id: 1, name: '新手上路', description: '完成第一個任務', icon: 'ri-trophy-line', color: 'yellow', unlocked: true },
    { id: 2, name: '連續簽到王', description: '連續簽到 7 天', icon: 'ri-fire-line', color: 'orange', unlocked: true },
    { id: 3, name: '社交達人', description: '分享 10 次內容', icon: 'ri-share-line', color: 'blue', unlocked: false },
    { id: 4, name: '積分大師', description: '累積 1000 積分', icon: 'ri-coin-line', color: 'green', unlocked: user.total_points >= 1000 },
    { id: 5, name: '完美主義者', description: '完成所有個人資料', icon: 'ri-user-star-line', color: 'purple', unlocked: false },
    { id: 6, name: '推薦之王', description: '成功推薦 5 位朋友', icon: 'ri-user-add-line', color: 'pink', unlocked: false }
  ];

  const stats = [
    { label: '總積分', value: user.total_points.toLocaleString(), icon: 'ri-coin-line', color: 'yellow' },
    { label: '等級', value: user.level, icon: 'ri-vip-crown-line', color: 'purple' },
    { label: '連續簽到', value: `${user.streak_days || 3} 天`, icon: 'ri-fire-line', color: 'orange' },
    { label: '完成任務', value: '12 個', icon: 'ri-task-line', color: 'green' }
  ];

  const menuItems = [
    { icon: 'ri-settings-line', label: '設定', action: () => setShowSettings(true) },
    { icon: 'ri-question-line', label: '幫助中心', action: () => {} },
    { icon: 'ri-feedback-line', label: '意見回饋', action: () => {} },
    { icon: 'ri-information-line', label: '關於我們', action: () => {} },
    { icon: 'ri-logout-circle-line', label: '登出', action: onLogout, color: 'text-red-500' }
  ];

  return (
    <div className="space-y-6">
      {/* 用戶資訊卡片 - 社交媒體風格 */}
      <div className="bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl font-bold">{user.name.charAt(0)}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-white/80 text-sm mb-2">{user.email}</p>
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 rounded-full px-3 py-1">
                <span className="text-sm font-bold">{user.level}</span>
              </div>
              <div className="bg-yellow-400/20 rounded-full px-3 py-1">
                <span className="text-sm font-bold">{user.total_points} 積分</span>
              </div>
            </div>
          </div>
        </div>

        {/* 進度條 - 多鄰國風格 */}
        <div className="bg-white/20 rounded-full p-1 mb-4">
          <div className="bg-white rounded-full h-3 flex items-center px-3" style={{ width: '65%' }}>
            <span className="text-xs font-bold text-purple-600">65% 到下一等級</span>
          </div>
        </div>

        {/* 快速統計 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold mb-1">{user.streak_days || 3}</div>
            <div className="text-xs text-white/80">連續天數</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold mb-1">12</div>
            <div className="text-xs text-white/80">完成任務</div>
          </div>
        </div>
      </div>

      {/* 統計數據 */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">我的數據</h3>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-2`}>
                <i className={`${stat.icon} text-${stat.color}-600 text-xl`}></i>
              </div>
              <div className="font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 成就系統 - 多鄰國風格 */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">成就徽章</h3>
          <span className="text-sm text-gray-500">
            {achievements.filter(a => a.unlocked).length}/{achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 ${
                achievement.unlocked 
                  ? `bg-${achievement.color}-100` 
                  : 'bg-gray-100'
              }`}>
                <i className={`${achievement.icon} text-xl ${
                  achievement.unlocked 
                    ? `text-${achievement.color}-600` 
                    : 'text-gray-400'
                }`}></i>
              </div>
              <div className={`text-xs font-medium ${
                achievement.unlocked ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {achievement.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 每週目標 - 多鄰國風格 */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">每週目標</h3>
          <button className="text-blue-600 text-sm font-medium">編輯</button>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">完成任務</span>
              <span className="text-sm font-bold text-gray-900">8/10</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">獲得積分</span>
              <span className="text-sm font-bold text-gray-900">180/200</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能選單 */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">更多功能</h3>
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`w-full flex items-center space-x-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200 ${item.color || 'text-gray-700'}`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <i className={`${item.icon} text-lg`}></i>
              </div>
              <span className="font-medium">{item.label}</span>
              <i className="ri-arrow-right-s-line text-gray-400 ml-auto"></i>
            </button>
          ))}
        </div>
      </div>

      {/* 設定彈窗 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">設定</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">推送通知</span>
                <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">聲音效果</span>
                <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">深色模式</span>
                <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 py-3 bg-blue-500 text-white rounded-2xl font-bold"
            >
              確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
