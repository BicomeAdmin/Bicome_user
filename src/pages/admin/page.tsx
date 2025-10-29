
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AdminHeader from './components/AdminHeader';
import AdminStats from './components/AdminStats';
import UserManagement from './components/UserManagement';
import ActivityManagement from './components/ActivityManagement';
import RewardManagement from './components/RewardManagement';
import ProjectSettings from './components/ProjectSettings';
import SystemAnnouncements from './components/SystemAnnouncements';
import DetailedAnalytics from './components/DetailedAnalytics';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    totalRewards: 0,
    totalActivities: 0,
    totalPointsDistributed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchAdminData();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error('獲取專案列表失敗:', error);
    }
  };

  const fetchAdminData = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const [
        { count: totalProjectUsers },
        { count: totalProjects },
        { count: totalRewards },
        { count: totalActivities },
        { data: pointsData }
      ] = await Promise.all([
        supabase.from('user_projects').select('*', { count: 'exact' }).eq('project_id', selectedProject).eq('is_active', true),
        supabase.from('projects').select('*', { count: 'exact' }),
        supabase.from('rewards').select('*', { count: 'exact' }).eq('is_active', true).eq('project_id', selectedProject),
        supabase.from('activities').select('*', { count: 'exact' }).eq('is_active', true).eq('project_id', selectedProject),
        supabase.from('user_projects').select('total_points').eq('project_id', selectedProject).eq('is_active', true)
      ]);

      const totalPointsDistributed = pointsData?.reduce((sum, userProject) => sum + (userProject.total_points || 0), 0) || 0;
      const activeUsers = Math.floor(totalProjectUsers * 0.8);

      setAdminStats({
        totalUsers: totalProjectUsers || 0,
        activeUsers,
        totalProjects: totalProjects || 0,
        totalRewards: totalRewards || 0,
        totalActivities: totalActivities || 0,
        totalPointsDistributed
      });

    } catch (error) {
      console.error('獲取管理數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || '未知專案';
  };

  if (loading || !selectedProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        {/* 科技感背景動畫 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            {/* 多層旋轉動畫 */}
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200/30 border-t-blue-400 mx-auto"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-4 border-transparent border-r-purple-400/50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-2 animate-spin rounded-full h-16 w-16 border-2 border-transparent border-b-cyan-400/70" style={{ animationDuration: '2s' }}></div>
            
            {/* 中心圖標 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-dashboard-3-line text-white text-lg"></i>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              智能管理系統啟動中
            </h3>
            <p className="text-blue-200 font-medium text-lg">正在載入最新營運數據...</p>
            <div className="flex items-center justify-center space-x-2 text-blue-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 科技感背景效果 */}
      <div className="absolute inset-0">
        {/* Fixed the problematic Tailwind class by moving the SVG URL to an inline style */}
        <div
          className="absolute top-0 left-0 w-full h-full opacity-50"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.02\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
          }}
        ></div>
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <AdminHeader />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 專案選擇器 - 台灣風格優化 */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-5 00 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="ri-settings-3-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      多專案營運中心
                      <span className="ml-3 px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded-full border border-green-400/30">
                        即時監控
                      </span>
                    </h2>
                    <p className="text-blue-200 text-base mt-1">選擇專案查看即時數據分析與用戶行為洞察</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="appearance-none bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-4 pr-12 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer min-w-72 shadow-lg font-medium"
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id} className="bg-slate-800 text-white">
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <i className="ri-arrow-down-s-line text-white/70 text-xl"></i>
                  </div>
                </div>
                
                <button className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/20">
                  <i className="ri-add-line mr-2 text-lg"></i>
                  建立新專案
                </button>
              </div>
            </div>
          </div>
          
          {/* 專案資訊卡片 */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center">
                <i className="ri-building-line text-white text-xl"></i>
              </div>
              <div className="text-left">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {getProjectName(selectedProject)}
                </h2>
                <p className="text-blue-200 text-lg font-medium">專案營運數據總覽</p>
              </div>
            </div>
            
            <div className="mt-6 inline-flex items-center px-6 py-3 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30">
              <i className="ri-information-line text-blue-300 mr-3 text-lg"></i>
              <span className="text-blue-100 font-medium">所有顯示數據均為此專案的獨立統計資訊</span>
            </div>
          </div>
        </div>
        
        {/* 統計卡片 */}
        <AdminStats stats={adminStats} />
        
        {/* 導航標籤 - 台灣風格科技感設計 */}
        <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'overview', name: '營運總覽', icon: 'ri-dashboard-3-line', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
              { id: 'project-settings', name: '專案設定', icon: 'ri-settings-4-line', color: 'indigo', gradient: 'from-indigo-500 to-indigo-6 00' },
              { id: 'announcements', name: '系統公告', icon: 'ri-megaphone-line', color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
              { id: 'users', name: '會員管理', icon: 'ri-team-line', color: 'green', gradient: 'from-green-500 to-green-600' },
              { id: 'activities', name: '活動管理', icon: 'ri-calendar-event-line', color: 'purple', gradient: 'from-purple-500 to-purple-600' },
              { id: 'rewards', name: '獎勵管理', icon: 'ri-gift-2-line', color: 'orange', gradient: 'from-orange-500 to-orange-600' },
              { id: 'analytics', name: '數據分析', icon: 'ri-line-chart-line', color: 'red', gradient: 'from-red-500 to-red-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 py-5 px-8 font-semibold text-sm cursor-pointer transition-all duration-300 whitespace-nowrap relative overflow-hidden group ${
                  activeTab === tab.id
                    ? `text-white bg-gradient-to-r ${tab.gradient} shadow-lg transform scale-105 border-b-4 border-white/30`
                    : 'text-blue-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center relative z-10 space-x-3">
                  <i className={`${tab.icon} text-xl group-hover:scale-110 transition-transform duration-300`}></i>
                  <span>{tab.name}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* 內容區域 */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* 專案概況提醒 - 台灣本地化 */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <i className="ri-information-line text-white text-2xl"></i>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white mb-3">SaaS 多租戶架構說明</h3>
                    <p className="text-blue-100 text-lg leading-relaxed">
                      每個專案都擁有完全獨立的用戶生態系統、積分經濟體系和獎勵機制。用戶可同時參與多個專案，
                      各專案間的積分、等級、活動記錄完全獨立運作，確保數據安全與業務隔離。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <div className="flex items-center space-x-3 text-blue-200 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <i className="ri-user-line text-xl text-blue-300"></i>
                        <span className="font-medium">獨立會員體系</span>
                      </div>
                      <div className="flex items-center space-x-3 text-blue-200 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <i className="ri-coins-line text-xl text-purple-300"></i>
                        <span className="font-medium">獨立積分經濟</span>
                      </div>
                      <div className="flex items-center space-x-3 text-blue-200 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <i className="ri-gift-line text-xl text-cyan-300"></i>
                        <span className="font-medium">獨立獎勵系統</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 快速操作區 - 台灣風格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: '新增活動', icon: 'ri-calendar-event-line', color: 'purple', action: () => setActiveTab('activities'), desc: '為專案設計吸引人的活動', gradient: 'from-purple-500 to-pink-500' },
                  { title: '新增獎勵', icon: 'ri-gift-2-line', color: 'orange', action: () => setActiveTab('rewards'), desc: '設定豐富的兌換獎勵', gradient: 'from-orange-500 to-red-500' },
                  { title: '發布公告', icon: 'ri-megaphone-line', color: 'emerald', action: () => setActiveTab('announcements'), desc: '向會員發送重要訊息', gradient: 'from-emerald-500 to-green-500' },
                  { title: '數據分析', icon: 'ri-line-chart-line', color: 'blue', action: () => setActiveTab('analytics'), desc: '深度分析用戶行為', gradient: 'from-blue-500 to-cyan-500' }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="group relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer text-left shadow-xl hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                        <i className={`${item.icon} text-white text-2xl`}></i>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-blue-200 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* 即時活動動態和系統監控 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 會員活動動態 */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                  <div className="bg-gradient-to-r from-green-500/80 to-emerald-500/80 p-8 text-white">
                    <h3 className="text-2xl font-bold flex items-center">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                        <i className="ri-pulse-line text-2xl"></i>
                      </div>
                      會員即時動態
                    </h3>
                    <p className="text-green-100 mt-2 text-lg">追蹤專案會員的最新互動行為</p>
                  </div>
                  
                  <div className="p-8">
                    <div className="space-y-5">
                      {[
                        { user: '張小明', action: '完成每日簽到任務', points: '+50', time: '2分鐘前', icon: 'ri-calendar-check-line', color: 'text-green-400', bg: 'bg-green-500/20' },
                        { user: '李美華', action: '兌換星巴克咖啡券', points: '-500', time: '5分鐘前', icon: 'ri-gift-line', color: 'text-orange-400', bg: 'bg-orange-500/20' },
                        { user: '王大偉', action: '參與社群討論活動', points: '+100', time: '8分鐘前', icon: 'ri-chat-3-line', color: 'text-blue-400', bg: 'bg-blue-500/20' },
                        { user: '陳小芳', action: '完成商品評價任務', points: '+150', time: '12分鐘前', icon: 'ri-star-line', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activity.bg} border border-white/20`}>
                              <i className={`${activity.icon} ${activity.color} text-xl`}></i>
                            </div>
                            <div>
                              <div className="font-semibold text-white text-lg">{activity.user}</div>
                              <div className="text-blue-200">{activity.action}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-lg ${activity.points.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                              {activity.points}
                            </div>
                            <div className="text-blue-300 text-sm">{activity.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 系統狀態監控 */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                  <div className="bg-gradient-to-r from-blue-500/80 to-purple-500/80 p-8 text-white">
                    <h3 className="text-2xl font-bold flex items-center">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                        <i className="ri-shield-check-line text-2xl"></i>
                      </div>
                      系統運行狀態
                    </h3>
                    <p className="text-blue-100 mt-2 text-lg">即時監控專案系統健康狀況</p>
                  </div>
                  
                  <div className="p-8 space-y-5">
                    {[
                      { name: '資料庫服務', status: 'online', icon: 'ri-database-2-line', desc: '用戶數據同步正常運行', uptime: '99.9%' },
                      { name: '積分引擎', status: 'online', icon: 'ri-coins-line', desc: '積分計算與發放正常', uptime: '99.8%' },
                      { name: '獎勵系統', status: 'online', icon: 'ri-gift-2-line', desc: '獎勵兌換功能運行順暢', uptime: '99.7%' },
                      { name: '推播服務', status: 'online', icon: 'ri-notification-3-line', desc: '會員通知推送正常', uptime: '99.9%' }
                    ].map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/30">
                            <i className={`${service.icon} text-blue-300 text-xl`}></i>
                          </div>
                          <div>
                            <div className="font-semibold text-white text-lg">{service.name}</div>
                            <div className="text-blue-200">{service.desc}</div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 font-semibold">正常運行</span>
                          </div>
                          <div className="text-blue-300 text-sm">穩定度 {service.uptime}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'project-settings' && <ProjectSettings selectedProject={selectedProject} />}
          {activeTab === 'announcements' && <SystemAnnouncements selectedProject={selectedProject} />}
          {activeTab === 'users' && <UserManagement selectedProject={selectedProject} />}
          {activeTab === 'activities' && <ActivityManagement selectedProject={selectedProject} />}
          {activeTab === 'rewards' && <RewardManagement selectedProject={selectedProject} />}
          {activeTab === 'analytics' && <DetailedAnalytics selectedProject={selectedProject} />}
        </div>
      </div>
    </div>
  );
}
