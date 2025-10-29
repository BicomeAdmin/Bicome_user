
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface DashboardHeaderProps {
  user: User | null;
  selectedProject: Project | null;
  onProjectChange: (project: Project) => void;
}

export default function DashboardHeader({ user, selectedProject, onProjectChange }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchUserStats();
    }
  }, [user]);

  // 監聽積分更新事件
  useEffect(() => {
    const handlePointsUpdate = () => {
      fetchUserStats();
    };
    window.addEventListener('pointsUpdated', handlePointsUpdate);
    return () => window.removeEventListener('pointsUpdated', handlePointsUpdate);
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select(`
          project_id,
          projects (
            id,
            name,
            description
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      const projectsData = data?.map(item => ({
        id: item.project_id,
        name: item.projects?.name || '未命名專案',
        description: item.projects?.description
      })) || [];

      setProjects(projectsData);

      // 如果沒有選中的專案，選擇第一個
      if (!selectedProject && projectsData.length > 0) {
        onProjectChange(projectsData[0]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!user || !selectedProject) return;

    try {
      const { data: userProject } = await supabase
        .from('user_projects')
        .select('total_points')
        .eq('user_id', user.id)
        .eq('project_id', selectedProject.id)
        .single();

      const points = userProject?.total_points || 0;
      setTotalPoints(points);

      // 計算等級和進度
      const level = Math.floor(points / 100) + 1;
      const progress = (points % 100);
      setCurrentLevel(level);
      setLevelProgress(progress);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('登出錯誤:', error);
      // 即使登出失敗也導航到登入頁面
      navigate('/auth');
    }
  };

  const getLevelBadge = (level: number) => {
    if (level >= 10) return { name: '鑽石', color: 'from-blue-400 to-purple-500', icon: 'ri-vip-diamond-line' };
    if (level >= 7) return { name: '黃金', color: 'from-yellow-400 to-orange-500', icon: 'ri-vip-crown-line' };
    if (level >= 4) return { name: '白銀', color: 'from-gray-300 to-gray-500', icon: 'ri-medal-line' };
    return { name: '青銅', color: 'from-orange-400 to-red-500', icon: 'ri-trophy-line' };
  };

  const levelBadge = getLevelBadge(currentLevel);

  if (!user) {
    return (
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <i className="ri-user-line text-white text-lg"></i>
            </div>
            <span className="text-gray-600">載入中...</span>
          </div>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回登入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* 桌面版 Header */}
      <div className="hidden md:block px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 左側：專案選擇器 */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors"
              >
                <i className="ri-folder-line text-gray-600"></i>
                <span className="font-medium text-gray-900">
                  {selectedProject?.name || '選擇專案'}
                </span>
                <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`}></i>
              </button>

              {showProjectDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          onProjectChange(project);
                          setShowProjectDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedProject?.id === project.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-gray-500 truncate">{project.description}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右側：用戶信息 */}
          <div className="flex items-center space-x-6">
            {/* 等級和積分 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 bg-gradient-to-r ${levelBadge.color} rounded-full flex items-center justify-center`}>
                  <i className={`${levelBadge.icon} text-white text-sm`}></i>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Lv.{currentLevel} {levelBadge.name}</div>
                  <div className="text-xs text-gray-500">{totalPoints} 積分</div>
                </div>
              </div>

              <div className="w-24">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{levelProgress}</span>
                  <span>100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${levelBadge.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${levelProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 用戶菜單 */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // 可以添加個人設定頁面導航
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center space-x-2"
                    >
                      <i className="ri-settings-line"></i>
                      <span>個人設定</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center space-x-2"
                    >
                      <i className="ri-logout-box-line"></i>
                      <span>登出</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 手機版 Header */}
      <div className="md:hidden px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">{totalPoints} 積分</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${levelBadge.color} rounded-full flex items-center justify-center`}>
              <i className={`${levelBadge.icon} text-white text-sm`}></i>
            </div>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="ri-more-line text-gray-600"></i>
            </button>
          </div>
        </div>

        {/* 手機版等級進度條 */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Lv.{currentLevel} {levelBadge.name}</span>
            <span>{levelProgress}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${levelBadge.color} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
        </div>

        {/* 手機版用戶菜單 */}
        {showUserMenu && (
          <div className="mt-3 bg-gray-50 rounded-xl p-3">
            <button
              onClick={() => {
                setShowUserMenu(false);
                // 可以添加個人設定頁面導航
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white text-gray-700 flex items-center space-x-2 mb-1"
            >
              <i className="ri-settings-line"></i>
              <span>個人設定</span>
            </button>
            <button
              onClick={() => {
                setShowUserMenu(false);
                handleLogout();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center space-x-2"
            >
              <i className="ri-logout-box-line"></i>
              <span>登出</span>
            </button>
          </div>
        )}
      </div>

      {/* 點擊外部關閉下拉菜單 */}
      {(showProjectDropdown || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowProjectDropdown(false);
            setShowUserMenu(false);
          }}
        ></div>
      )}
    </div>
  );
}
