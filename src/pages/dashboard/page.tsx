
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase-singleton';
import DashboardHeader from './components/DashboardHeader';
import StatsCards from './components/StatsCards';
import ActivityList from './components/ActivityList';
import RewardsCenter from './components/RewardsCenter';
import PointsHistory from './components/PointsHistory';
import UserProfile from './components/UserProfile';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: string;
  avatar?: string;
  streak_days?: number;
  total_activities?: number;
  total_redemptions?: number;
  rank?: number;
  weekly_goal?: number;
  weekly_progress?: number;
  referral_count?: number;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/auth');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('載入用戶資料:', parsedUser);
      setUser(parsedUser);
      
      // 設定預設專案
      const defaultProject = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'RewardHub',
        description: '智能獎勵生態系統'
      };
      setSelectedProject(defaultProject);
      
      setLoading(false);
    } catch (error) {
      console.error('解析用戶資料錯誤:', error);
      navigate('/auth');
    }
  }, [navigate]);

  // 監聽積分更新事件
  useEffect(() => {
    const handlePointsUpdate = (event: any) => {
      if (event.detail?.pointsEarned && user) {
        setUser(prev => prev ? {
          ...prev,
          points: prev.points + event.detail.pointsEarned
        } : null);
      }
    };

    window.addEventListener('pointsUpdated', handlePointsUpdate);
    return () => window.removeEventListener('pointsUpdated', handlePointsUpdate);
  }, [user]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('登出錯誤:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('userSession');
      navigate('/auth');
    }
  };

  if (loading || !user || !selectedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="ri-trophy-line text-white text-2xl"></i>
          </div>
          <div className="text-lg font-semibold text-gray-700 mb-2">載入中...</div>
          <div className="text-sm text-gray-500">正在準備您的專屬空間</div>
        </div>
      </div>
    );
  }

  // 桌面版布局
  const DesktopLayout = () => (
    <div className="hidden lg:block min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 頂部導航 */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <i className="ri-trophy-line text-white text-lg"></i>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">RewardHub</div>
                <div className="text-xs text-gray-500">智能獎勵平台</div>
              </div>
            </div>

            {/* 用戶信息 */}
            <div className="flex items-center space-x-6">
              {/* 積分顯示 */}
              <div className="flex items-center space-x-3 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-full border border-yellow-200">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <i className="ri-coin-line text-white text-sm"></i>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{(user?.points ?? 0).toLocaleString()}</div>
                  <div className="text-xs text-orange-500">積分</div>
                </div>
              </div>

              {/* 用戶頭像和菜單 */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{user?.name?.charAt(0) ?? 'U'}</span>
                  </div>
                  <div className="text-left pr-2">
                    <div className="text-sm font-semibold text-gray-900">{user?.name ?? '使用者'}</div>
                    <div className="text-xs text-gray-500">{user?.level ?? '一般'} 會員</div>
                  </div>
                  <i className={`ri-arrow-down-s-line text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
                </button>

                {/* 下拉菜單 */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                    <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                      <i className="ri-user-settings-line text-gray-500"></i>
                      <span className="text-gray-700">個人設定</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center space-x-3 transition-colors text-red-600"
                    >
                      <i className="ri-logout-box-line"></i>
                      <span>登出</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 歡迎區域 */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">嗨，{user?.name ?? '使用者'}！👋</h1>
                  <p className="text-blue-100 text-lg">今天也要繼續努力賺積分喔！</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1">{(user?.points ?? 0).toLocaleString()}</div>
                  <div className="text-blue-200">總積分</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 統計卡片 */}
        <div className="mb-8">
          <StatsCards 
            userId={user.id} 
            currentProjectId={selectedProject.id}
            user={user}
            selectedProject={selectedProject}
          />
        </div>

        {/* 主要內容區域 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左側：任務列表 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                  <i className="ri-task-line text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">今日任務</h2>
                  <p className="text-gray-500 text-sm">完成任務獲得積分獎勵</p>
                </div>
              </div>
              <ActivityList 
                userId={user.id} 
                currentProjectId={selectedProject.id}
                user={user}
                selectedProject={selectedProject}
                fullView={true}
              />
            </div>
          </div>

          {/* 右側：獎勵中心和歷史記錄 */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
                  <i className="ri-gift-line text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">獎勵中心</h2>
                  <p className="text-gray-500 text-sm">用積分兌換好禮</p>
                </div>
              </div>
              <RewardsCenter 
                userId={user.id} 
                currentProjectId={selectedProject.id}
                user={user}
                selectedProject={selectedProject}
                fullView={false}
              />
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
                  <i className="ri-history-line text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">積分記錄</h2>
                  <p className="text-gray-500 text-sm">查看積分變動</p>
                </div>
              </div>
              <PointsHistory 
                userId={user.id} 
                currentProjectId={selectedProject.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 手機版布局
  const MobileLayout = () => (
    <div className="lg:hidden min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      {/* 頂部導航 */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <i className="ri-trophy-line text-white text-lg"></i>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">RewardHub</div>
                <div className="text-xs text-gray-500">智能獎勵平台</div>
              </div>
            </div>

            {/* 積分和用戶 */}
            <div className="flex items-center space-x-3">
              {/* 積分 */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-2 rounded-full border border-yellow-200">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <i className="ri-coin-line text-white text-xs"></i>
                </div>
                <span className="text-sm font-bold text-orange-600">{(user?.points ?? 0).toLocaleString()}</span>
              </div>

              {/* 用戶頭像 */}
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">{user?.name?.charAt(0) ?? 'U'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="px-4 py-6">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* 歡迎卡片 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <h1 className="text-2xl font-bold mb-2">嗨，{user?.name ?? '使用者'}！👋</h1>
                <p className="text-blue-100 mb-4">今天也要繼續努力賺積分喔！</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">{(user?.points ?? 0).toLocaleString()}</div>
                    <div className="text-blue-200 text-sm">總積分</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{user?.level ?? '一般'}</div>
                    <div className="text-blue-200 text-sm">會員等級</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 統計卡片 */}
            <StatsCards 
              userId={user.id} 
              currentProjectId={selectedProject.id}
              user={user}
              selectedProject={selectedProject}
            />

            {/* 快速任務 */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                  <i className="ri-task-line text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">快速任務</h2>
                  <p className="text-gray-500 text-sm">完成任務獲得積分</p>
                </div>
              </div>
              <ActivityList 
                userId={user.id} 
                currentProjectId={selectedProject.id}
                user={user}
                selectedProject={selectedProject}
                fullView={false}
              />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                  <i className="ri-task-line text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">所有任務</h2>
                  <p className="text-gray-500 text-sm">完成任務獲得積分獎勵</p>
                </div>
              </div>
              <ActivityList 
                userId={user.id} 
                currentProjectId={selectedProject.id}
                user={user}
                selectedProject={selectedProject}
                fullView={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center">
                  <i className="ri-gift-line text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">獎勵中心</h2>
                  <p className="text-gray-500 text-sm">用積分兌換精美好禮</p>
                </div>
              </div>
              <RewardsCenter 
                userId={user.id} 
                currentProjectId={selectedProject.id}
                user={user}
                selectedProject={selectedProject}
                fullView={true}
              />
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <UserProfile user={user} onLogout={handleLogout} />
            
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center">
                  <i className="ri-history-line text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">積分記錄</h2>
                  <p className="text-gray-500 text-sm">查看積分變動歷史</p>
                </div>
              </div>
              <PointsHistory 
                userId={user.id} 
                currentProjectId={selectedProject.id}
              />
            </div>
          </div>
        )}
      </div>

      {/* 底部導航 - 多鄰國風格 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {[
            { id: 'home', icon: 'ri-home-5-fill', label: '首頁', color: 'blue' },
            { id: 'tasks', icon: 'ri-task-fill', label: '任務', color: 'green' },
            { id: 'rewards', icon: 'ri-gift-fill', label: '獎勵', color: 'purple' },
            { id: 'profile', icon: 'ri-user-fill', label: '我的', color: 'indigo' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                activeTab === tab.id 
                  ? `text-${tab.color}-600 bg-${tab.color}-50` 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className={`${tab.icon} text-xl`}></i>
              <span className="text-xs font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-${tab.color}-500 rounded-full`}></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DesktopLayout />
      <MobileLayout />
      
      {/* 點擊外部關閉菜單 */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </>
  );
};

export default DashboardPage;
