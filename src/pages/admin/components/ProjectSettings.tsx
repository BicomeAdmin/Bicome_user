
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface ProjectSettingsProps {
  selectedProject: string;
}

export default function ProjectSettings({ selectedProject }: ProjectSettingsProps) {
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    website_url: '',
    contact_email: '',
    point_system_enabled: true,
    experience_system_enabled: true,
    referral_enabled: true,
    auto_approve_activities: false,
    max_daily_points: 1000,
    point_expiry_days: 365,
    welcome_points: 100
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (selectedProject) {
      fetchProjectSettings();
    }
  }, [selectedProject]);

  const fetchProjectSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', selectedProject)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProjectData({
          name: data.name || '',
          description: data.description || '',
          website_url: data.website_url || '',
          contact_email: data.contact_email || '',
          point_system_enabled: data.point_system_enabled ?? true,
          experience_system_enabled: data.experience_system_enabled ?? true,
          referral_enabled: data.referral_enabled ?? true,
          auto_approve_activities: data.auto_approve_activities ?? false,
          max_daily_points: data.max_daily_points || 1000,
          point_expiry_days: data.point_expiry_days || 365,
          welcome_points: data.welcome_points || 100
        });
      }
    } catch (error) {
      console.error('獲取專案設定失敗:', error);
      setMessage({ type: 'error', text: '載入專案設定失敗' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', selectedProject);
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: '專案設定已成功更新！' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('保存專案設定失敗:', error);
      setMessage({ type: 'error', text: '保存設定失敗，請稍後再試' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* 標題區 */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <i className="ri-settings-4-line text-xl"></i>
              </div>
              專案基礎設定
            </h3>
            <p className="text-indigo-100 mt-1">配置專案的基本資訊和系統參數</p>
          </div>
          
          {message.text && (
            <div className={`px-4 py-2 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center">
                <i className={`${message.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} mr-2`}></i>
                {message.text}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* 基本資訊 */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="ri-information-line mr-2 text-indigo-500"></i>
            基本資訊
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">專案名稱</label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="輸入專案名稱"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">聯絡信箱</label>
              <input
                type="email"
                value={projectData.contact_email}
                onChange={(e) => setProjectData({...projectData, contact_email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="contact@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">專案描述</label>
            <textarea
              value={projectData.description}
              onChange={(e) => setProjectData({...projectData, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              rows="4"
              placeholder="詳細描述您的專案內容和目標"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">官方網站</label>
            <input
              type="url"
              value={projectData.website_url}
              onChange={(e) => setProjectData({...projectData, website_url: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              placeholder="https://www.example.com"
            />
          </div>
        </div>

        {/* 系統功能設定 */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="ri-function-line mr-2 text-indigo-500"></i>
            系統功能設定
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'point_system_enabled', label: '積分系統', desc: '啟用用戶積分獲得和消費功能', icon: 'ri-coins-line' },
              { key: 'experience_system_enabled', label: '經驗值系統', desc: '啟用用戶經驗值和等級系統', icon: 'ri-trophy-line' },
              { key: 'referral_enabled', label: '推薦系統', desc: '允許用戶推薦新用戶獲得獎勵', icon: 'ri-user-add-line' },
              { key: 'auto_approve_activities', label: '自動審核', desc: '自動審核用戶完成的活動', icon: 'ri-check-double-line' }
            ].map((setting) => (
              <div key={setting.key} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <i className={`${setting.icon} text-indigo-600`}></i>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">{setting.label}</h5>
                      <p className="text-sm text-gray-600 mt-1">{setting.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={projectData[setting.key]}
                      onChange={(e) => setProjectData({...projectData, [setting.key]: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 積分系統參數 */}
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="ri-settings-3-line mr-2 text-indigo-500"></i>
            積分系統參數
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">每日積分上限</label>
              <div className="relative">
                <input
                  type="number"
                  value={projectData.max_daily_points}
                  onChange={(e) => setProjectData({...projectData, max_daily_points: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  min="0"
                />
                <i className="ri-coins-line absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500"></i>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">積分有效期（天）</label>
              <div className="relative">
                <input
                  type="number"
                  value={projectData.point_expiry_days}
                  onChange={(e) => setProjectData({...projectData, point_expiry_days: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  min="0"
                />
                <i className="ri-calendar-line absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500"></i>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">新用戶歡迎積分</label>
              <div className="relative">
                <input
                  type="number"
                  value={projectData.welcome_points}
                  onChange={(e) => setProjectData({...projectData, welcome_points: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  min="0"
                />
                <i className="ri-gift-line absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"></i>
              </div>
            </div>
          </div>
        </div>

        {/* 保存按鈕 */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 cursor-pointer whitespace-nowrap font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                保存中...
              </div>
            ) : (
              <div className="flex items-center">
                <i className="ri-save-line mr-2"></i>
                保存設定
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
