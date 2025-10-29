
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

export default function RewardManagement() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 0,
    stock_quantity: 0,
    reward_type: 'voucher',
    is_active: true
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select(`
          *,
          user_redemptions(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('獲取獎勵數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReward) {
        const { error } = await supabase
          .from('rewards')
          .update(formData)
          .eq('id', editingReward.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rewards')
          .insert([formData]);
        if (error) throw error;
      }
      
      setShowCreateModal(false);
      setEditingReward(null);
      setFormData({
        name: '',
        description: '',
        points_required: 0,
        stock_quantity: 0,
        reward_type: 'voucher',
        is_active: true
      });
      fetchRewards();
    } catch (error) {
      console.error('保存獎勵失敗:', error);
    }
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      points_required: reward.points_required,
      stock_quantity: reward.stock_quantity,
      reward_type: reward.reward_type,
      is_active: reward.is_active
    });
    setShowCreateModal(true);
  };

  const handleToggleStatus = async (reward) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ is_active: !reward.is_active })
        .eq('id', reward.id);
      
      if (error) throw error;
      fetchRewards();
    } catch (error) {
      console.error('更新獎勵狀態失敗:', error);
    }
  };

  const getRewardTypeLabel = (type) => {
    const types = {
      'voucher': '優惠券',
      'discount': '折扣券',
      'gift': '實體禮品',
      'service': '服務券',
      'upgrade': '升級券'
    };
    return types[type] || type;
  };

  const getRewardTypeColor = (type) => {
    const colors = {
      'voucher': 'bg-blue-100 text-blue-800',
      'discount': 'bg-green-100 text-green-800',
      'gift': 'bg-purple-100 text-purple-800',
      'service': 'bg-orange-100 text-orange-800',
      'upgrade': 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: '缺貨', color: 'text-red-600' };
    if (stock < 10) return { label: '庫存不足', color: 'text-yellow-600' };
    return { label: '庫存充足', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* 標題和操作區 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="ri-gift-2-line mr-2 text-orange-500"></i>
            獎勵管理
            <span className="ml-2 text-sm font-normal text-gray-500">({rewards.length} 個獎勵)</span>
          </h3>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap flex items-center"
          >
            <i className="ri-add-line mr-2"></i>
            新增獎勵
          </button>
        </div>
      </div>

      {/* 獎勵列表 */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const stockStatus = getStockStatus(reward.stock_quantity);
            const redemptionCount = reward.user_redemptions?.length || 0;
            
            return (
              <div key={reward.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center">
                  <i className="ri-gift-line text-4xl text-white"></i>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 flex-1">{reward.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      reward.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reward.is_active ? '上架中' : '已下架'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reward.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRewardTypeColor(reward.reward_type)}`}>
                        {getRewardTypeLabel(reward.reward_type)}
                      </span>
                      <span className="flex items-center text-sm text-yellow-600 font-medium">
                        <i className="ri-coins-line mr-1"></i>
                        {reward.points_required}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={stockStatus.color}>
                        庫存: {reward.stock_quantity}
                      </span>
                      <span className="text-gray-500">
                        已兌換: {redemptionCount}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(reward)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-edit-line mr-1"></i>
                      編輯
                    </button>
                    <button
                      onClick={() => handleToggleStatus(reward)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        reward.is_active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <i className={`${reward.is_active ? 'ri-eye-off-line' : 'ri-eye-line'} mr-1`}></i>
                      {reward.is_active ? '下架' : '上架'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-gift-2-line text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 font-medium">尚未建立任何獎勵</p>
            <p className="text-sm text-gray-400 mt-1">點擊「新增獎勵」開始建立您的第一個獎勵</p>
          </div>
        )}
      </div>

      {/* 新增/編輯獎勵彈窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingReward ? '編輯獎勵' : '新增獎勵'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">獎勵名稱</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">獎勵描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所需積分</label>
                  <input
                    type="number"
                    value={formData.points_required}
                    onChange={(e) => setFormData({...formData, points_required: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">庫存數量</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">獎勵類型</label>
                <select
                  value={formData.reward_type}
                  onChange={(e) => setFormData({...formData, reward_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
                >
                  <option value="voucher">優惠券</option>
                  <option value="discount">折扣券</option>
                  <option value="gift">實體禮品</option>
                  <option value="service">服務券</option>
                  <option value="upgrade">升級券</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">立即上架獎勵</label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReward(null);
                    setFormData({
                      name: '',
                      description: '',
                      points_required: 0,
                      stock_quantity: 0,
                      reward_type: 'voucher',
                      is_active: true
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {editingReward ? '更新' : '建立'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
