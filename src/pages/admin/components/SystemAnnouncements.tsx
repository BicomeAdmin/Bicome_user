
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface SystemAnnouncementsProps {
  selectedProject: string;
}

export default function SystemAnnouncements({ selectedProject }: SystemAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    is_active: true,
    priority: 'normal',
    target_audience: 'all',
    expires_at: ''
  });

  useEffect(() => {
    if (selectedProject) {
      fetchAnnouncements();
    }
  }, [selectedProject]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('project_id', selectedProject)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('獲取公告數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const announcementData = {
        ...formData,
        project_id: selectedProject,
        expires_at: formData.expires_at || null
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([announcementData]);
        if (error) throw error;
      }
      
      setShowCreateModal(false);
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        type: 'info',
        is_active: true,
        priority: 'normal',
        target_audience: 'all',
        expires_at: ''
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('保存公告失敗:', error);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      is_active: announcement.is_active,
      priority: announcement.priority,
      target_audience: announcement.target_audience,
      expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : ''
    });
    setShowCreateModal(true);
  };

  const handleToggleStatus = async (announcement) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !announcement.is_active })
        .eq('id', announcement.id);
      
      if (error) throw error;
      fetchAnnouncements();
    } catch (error) {
      console.error('更新公告狀態失敗:', error);
    }
  };

  const getTypeConfig = (type) => {
    const configs = {
      'info': { label: '一般資訊', color: 'blue', icon: 'ri-information-line' },
      'warning': { label: '重要提醒', color: 'yellow', icon: 'ri-alert-line' },
      'success': { label: '好消息', color: 'green', icon: 'ri-check-line' },
      'error': { label: '緊急通知', color: 'red', icon: 'ri-error-warning-line' },
      'maintenance': { label: '系統維護', color: 'purple', icon: 'ri-tools-line' }
    };
    return configs[type] || configs.info;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      'low': { label: '低', color: 'gray' },
      'normal': { label: '普通', color: 'blue' },
      'high': { label: '高', color: 'orange' },
      'urgent': { label: '緊急', color: 'red' }
    };
    return configs[priority] || configs.normal;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* 標題和操作區 */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <i className="ri-megaphone-line text-xl"></i>
              </div>
              系統公告管理
            </h3>
            <p className="text-emerald-100 mt-1">
              發布和管理系統公告 - {announcements.length} 則公告
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="ri-add-line mr-2 text-lg"></i>
            發布公告
          </button>
        </div>
      </div>

      {/* 公告列表 */}
      <div className="p-6">
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const typeConfig = getTypeConfig(announcement.type);
            const priorityConfig = getPriorityConfig(announcement.priority);
            const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();
            
            return (
              <div key={announcement.id} className={`border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
                announcement.is_active && !isExpired 
                  ? 'border-emerald-200 bg-gradient-to-r from-white to-emerald-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-r from-${typeConfig.color}-400 to-${typeConfig.color}-500 rounded-lg flex items-center justify-center`}>
                        <i className={`${typeConfig.icon} text-white`}></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{announcement.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${typeConfig.color}-100 text-${typeConfig.color}-800 border border-${typeConfig.color}-200`}>
                            {typeConfig.label}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${priorityConfig.color}-100 text-${priorityConfig.color}-800 border border-${priorityConfig.color}-200`}>
                            優先級: {priorityConfig.label}
                          </span>
                          {isExpired && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                              已過期
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">{announcement.content}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <i className="ri-calendar-line mr-1"></i>
                          發布: {formatDate(announcement.created_at)}
                        </span>
                        {announcement.expires_at && (
                          <span className="flex items-center">
                            <i className="ri-time-line mr-1"></i>
                            到期: {formatDate(announcement.expires_at)}
                          </span>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        announcement.is_active && !isExpired
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {announcement.is_active && !isExpired ? '顯示中' : '已隱藏'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-100 hover:to-blue-200 transition-all duration-300 cursor-pointer whitespace-nowrap border border-blue-200"
                    >
                      <i className="ri-edit-line mr-1"></i>
                      編輯
                    </button>
                    <button
                      onClick={() => handleToggleStatus(announcement)}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer whitespace-nowrap border ${
                        announcement.is_active
                          ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 border-red-200'
                          : 'bg-gradient-to-r from-green-50 to-green-100 text-green-600 hover:from-green-100 hover:to-green-200 border-green-200'
                      }`}
                    >
                      <i className={`${announcement.is_active ? 'ri-eye-off-line' : 'ri-eye-line'} mr-1`}></i>
                      {announcement.is_active ? '隱藏' : '顯示'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-megaphone-line text-4xl text-emerald-600"></i>
            </div>
            <p className="text-gray-600 font-semibold text-lg">尚未發布任何公告</p>
            <p className="text-sm text-gray-500 mt-2">點擊「發布公告」開始建立您的第一則公告</p>
          </div>
        )}
      </div>

      {/* 新增/編輯公告彈窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white rounded-t-xl">
              <h3 className="text-xl font-bold flex items-center">
                <i className={`${editingAnnouncement ? 'ri-edit-line' : 'ri-add-line'} mr-3 text-xl`}></i>
                {editingAnnouncement ? '編輯公告' : '發布新公告'}
              </h3>
              <p className="text-emerald-100 mt-1">
                向用戶發布重要資訊和通知
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">公告標題</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  placeholder="輸入公告標題"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">公告內容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  rows="6"
                  placeholder="詳細描述公告內容"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">公告類型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-300"
                  >
                    <option value="info">一般資訊</option>
                    <option value="warning">重要提醒</option>
                    <option value="success">好消息</option>
                    <option value="error">緊急通知</option>
                    <option value="maintenance">系統維護</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">優先級</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-300"
                  >
                    <option value="low">低</option>
                    <option value="normal">普通</option>
                    <option value="high">高</option>
                    <option value="urgent">緊急</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">目標對象</label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-300"
                  >
                    <option value="all">所有用戶</option>
                    <option value="new">新用戶</option>
                    <option value="active">活躍用戶</option>
                    <option value="vip">VIP用戶</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">到期日期（可選）</label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="is_active" className="ml-3 text-sm font-medium text-gray-700">
                  立即發布公告
                </label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAnnouncement(null);
                    setFormData({
                      title: '',
                      content: '',
                      type: 'info',
                      is_active: true,
                      priority: 'normal',
                      target_audience: 'all',
                      expires_at: ''
                    });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-all duration-300 cursor-pointer whitespace-nowrap font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 cursor-pointer whitespace-nowrap font-medium shadow-lg"
                >
                  {editingAnnouncement ? '更新公告' : '發布公告'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
