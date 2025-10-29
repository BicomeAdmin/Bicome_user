
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface ActivityManagementProps {
  selectedProject: string;
}

export default function ActivityManagement({ selectedProject }: ActivityManagementProps) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points: 0,
    activity_type: 'daily',
    is_active: true
  });

  useEffect(() => {
    if (selectedProject) {
      fetchActivities();
    }
  }, [selectedProject]);

  const fetchActivities = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          user_activities(count)
        `)
        .eq('project_id', selectedProject)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('獲取活動數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const activityData = {
        ...formData,
        project_id: selectedProject
      };

      if (editingActivity) {
        const { error } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', editingActivity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('activities')
          .insert([activityData]);
        if (error) throw error;
      }
      
      setShowCreateModal(false);
      setEditingActivity(null);
      setFormData({
        name: '',
        description: '',
        points: 0,
        activity_type: 'daily',
        is_active: true
      });
      fetchActivities();
    } catch (error) {
      console.error('保存活動失敗:', error);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description,
      points: activity.points,
      activity_type: activity.activity_type,
      is_active: activity.is_active
    });
    setShowCreateModal(true);
  };

  const handleToggleStatus = async (activity) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ is_active: !activity.is_active })
        .eq('id', activity.id);
      
      if (error) throw error;
      fetchActivities();
    } catch (error) {
      console.error('更新活動狀態失敗:', error);
    }
  };

  const getActivityTypeLabel = (type) => {
    const types = {
      'daily': '每日任務',
      'weekly': '週任務',
      'monthly': '月任務',
      'special': '特殊活動',
      'referral': '推薦任務'
    };
    return types[type] || type;
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'daily': 'bg-blue-100 text-blue-800 border-blue-200',
      'weekly': 'bg-green-100 text-green-800 border-green-200',
      'monthly': 'bg-purple-100 text-purple-800 border-purple-200',
      'special': 'bg-red-100 text-red-800 border-red-200',
      'referral': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getActivityTypeIcon = (type) => {
    const icons = {
      'daily': 'ri-calendar-check-line',
      'weekly': 'ri-calendar-2-line',
      'monthly': 'ri-calendar-event-line',
      'special': 'ri-star-line',
      'referral': 'ri-user-add-line'
    };
    return icons[type] || 'ri-calendar-line';
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || activity.activity_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* 標題和操作區 */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <i className="ri-calendar-event-line text-xl"></i>
              </div>
              活動管理
            </h3>
            <p className="text-purple-100 mt-1">
              當前專案 - {activities.length} 個活動
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="ri-add-line mr-2 text-lg"></i>
            新增活動
          </button>
        </div>
      </div>

      {/* 搜尋和篩選區 */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="搜尋活動名稱或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
          >
            <option value="all">所有類型</option>
            <option value="daily">每日任務</option>
            <option value="weekly">週任務</option>
            <option value="monthly">月任務</option>
            <option value="special">特殊活動</option>
            <option value="referral">推薦任務</option>
          </select>
        </div>
      </div>

      {/* 活動列表 */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="border-2 border-gray-100 rounded-xl p-6 hover:border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getActivityTypeColor(activity.activity_type).replace('text-', 'text-white bg-').replace('bg-', 'bg-gradient-to-r from-').replace('-100', '-400 to-').replace('-800', '-500')}`}>
                      <i className={`${getActivityTypeIcon(activity.activity_type)} text-white`}></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">{activity.name}</h4>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{activity.description}</p>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getActivityTypeColor(activity.activity_type)}`}>
                      {getActivityTypeLabel(activity.activity_type)}
                    </span>
                    <span className="flex items-center text-sm font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                      <i className="ri-coins-line mr-1"></i>
                      {activity.points} 積分
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <i className="ri-user-line mr-1"></i>
                      <span>參與: {activity.user_activities?.length || 0} 次</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activity.is_active 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {activity.is_active ? '進行中' : '已暫停'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(activity)}
                  className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:from-blue-100 hover:to-blue-200 transition-all duration-300 cursor-pointer whitespace-nowrap border border-blue-200"
                >
                  <i className="ri-edit-line mr-1"></i>
                  編輯
                </button>
                <button
                  onClick={() => handleToggleStatus(activity)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer whitespace-nowrap border ${
                    activity.is_active
                      ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 border-red-200'
                      : 'bg-gradient-to-r from-green-50 to-green-100 text-green-600 hover:from-green-100 hover:to-green-200 border-green-200'
                  }`}
                >
                  <i className={`${activity.is_active ? 'ri-pause-line' : 'ri-play-line'} mr-1`}></i>
                  {activity.is_active ? '暫停' : '啟用'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-calendar-event-line text-4xl text-purple-600"></i>
            </div>
            <p className="text-gray-600 font-semibold text-lg">
              {searchTerm || filterType !== 'all' ? '找不到符合條件的活動' : '尚未建立任何活動'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm || filterType !== 'all' ? '請嘗試調整搜尋條件' : '點擊「新增活動」開始建立您的第一個活動'}
            </p>
          </div>
        )}
      </div>

      {/* 新增/編輯活動彈窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white rounded-t-xl">
              <h3 className="text-xl font-bold flex items-center">
                <i className={`${editingActivity ? 'ri-edit-line' : 'ri-add-line'} mr-3 text-xl`}></i>
                {editingActivity ? '編輯活動' : '新增活動'}
              </h3>
              <p className="text-purple-100 mt-1">
                為當前專案建立新的積分活動
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">活動名稱</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="輸入活動名稱"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">活動描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  rows="3"
                  placeholder="詳細描述活動內容和規則"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">獎勵積分</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    min="0"
                    placeholder="0"
                    required
                  />
                  <i className="ri-coins-line absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500"></i>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">活動類型</label>
                <select
                  value={formData.activity_type}
                  onChange={(e) => setFormData({...formData, activity_type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer transition-all duration-300"
                >
                  <option value="daily">每日任務</option>
                  <option value="weekly">週任務</option>
                  <option value="monthly">月任務</option>
                  <option value="special">特殊活動</option>
                  <option value="referral">推薦任務</option>
                </select>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="ml-3 text-sm font-medium text-gray-700">
                  立即啟用活動
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingActivity(null);
                    setFormData({
                      name: '',
                      description: '',
                      points: 0,
                      activity_type: 'daily',
                      is_active: true
                    });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-all duration-300 cursor-pointer whitespace-nowrap font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 cursor-pointer whitespace-nowrap font-medium shadow-lg"
                >
                  {editingActivity ? '更新活動' : '建立活動'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
