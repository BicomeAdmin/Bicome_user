
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface DetailedAnalyticsProps {
  selectedProject: string;
}

export default function DetailedAnalytics({ selectedProject }: DetailedAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    pointsFlow: [],
    activityStats: [],
    rewardStats: [],
    userEngagement: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeMetric, setActiveMetric] = useState('users');

  useEffect(() => {
    if (selectedProject) {
      fetchAnalyticsData();
    }
  }, [selectedProject, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // 計算時間範圍
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // 獲取用戶增長數據
      const { data: userGrowthData } = await supabase
        .from('users')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      // 獲取積分流動數據
      const { data: pointsFlowData } = await supabase
        .from('user_activities')
        .select(`
          created_at,
          activities!inner(points, project_id)
        `)
        .eq('activities.project_id', selectedProject)
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      // 獲取活動統計
      const { data: activityStatsData } = await supabase
        .from('user_activities')
        .select(`
          created_at,
          activities!inner(name, points, project_id)
        `)
        .eq('activities.project_id', selectedProject)
        .gte('created_at', startDate.toISOString());

      // 獲取獎勵統計
      const { data: rewardStatsData } = await supabase
        .from('user_redemptions')
        .select(`
          created_at,
          rewards!inner(name, points_required, project_id)
        `)
        .eq('rewards.project_id', selectedProject)
        .gte('created_at', startDate.toISOString());

      // 處理數據
      setAnalyticsData({
        userGrowth: processUserGrowthData(userGrowthData || []),
        pointsFlow: processPointsFlowData(pointsFlowData || []),
        activityStats: processActivityStats(activityStatsData || []),
        rewardStats: processRewardStats(rewardStatsData || []),
        userEngagement: calculateUserEngagement(activityStatsData || [], rewardStatsData || [])
      });

    } catch (error) {
      console.error('獲取分析數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const processUserGrowthData = (data) => {
    const dailyGrowth = {};
    data.forEach(user => {
      const date = new Date(user.created_at).toLocaleDateString();
      dailyGrowth[date] = (dailyGrowth[date] || 0) + 1;
    });
    return Object.entries(dailyGrowth).map(([date, count]) => ({ date, count }));
  };

  const processPointsFlowData = (data) => {
    const dailyPoints = {};
    data.forEach(activity => {
      const date = new Date(activity.created_at).toLocaleDateString();
      dailyPoints[date] = (dailyPoints[date] || 0) + (activity.activities?.points || 0);
    });
    return Object.entries(dailyPoints).map(([date, points]) => ({ date, points }));
  };

  const processActivityStats = (data) => {
    const activityCounts = {};
    data.forEach(activity => {
      const name = activity.activities?.name || '未知活動';
      activityCounts[name] = (activityCounts[name] || 0) + 1;
    });
    return Object.entries(activityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const processRewardStats = (data) => {
    const rewardCounts = {};
    data.forEach(redemption => {
      const name = redemption.rewards?.name || '未知獎勵';
      rewardCounts[name] = (rewardCounts[name] || 0) + 1;
    });
    return Object.entries(rewardCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const calculateUserEngagement = (activities, redemptions) => {
    const totalActivities = activities.length;
    const totalRedemptions = redemptions.length;
    const engagementRate = totalActivities > 0 ? (totalRedemptions / totalActivities * 100) : 0;
    
    return {
      totalActivities,
      totalRedemptions,
      engagementRate: Math.round(engagementRate * 100) / 100
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 控制面板 */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-xl font-bold flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <i className="ri-line-chart-line text-xl"></i>
                </div>
                詳細數據分析
              </h3>
              <p className="text-red-100 mt-1">深入了解用戶行為和系統表現</p>
            </div>
            
            <div className="flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white/20 text-white border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 cursor-pointer"
              >
                <option value="7d" className="text-gray-900">近7天</option>
                <option value="30d" className="text-gray-900">近30天</option>
                <option value="90d" className="text-gray-900">近90天</option>
              </select>
              
              <button
                onClick={fetchAnalyticsData}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center"
              >
                <i className="ri-refresh-line mr-2"></i>刷新
              </button>
            </div>
          </div>
        </div>

        {/* 指標選擇 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'users', name: '用戶增長', icon: 'ri-user-add-line', color: 'blue' },
              { id: 'points', name: '積分流動', icon: 'ri-coins-line', color: 'yellow' },
              { id: 'activities', name: '活動參與', icon: 'ri-calendar-event-line', color: 'purple' },
              { id: 'rewards', name: '獎勵兌換', icon: 'ri-gift-line', color: 'orange' }
            ].map((metric) => (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap ${
                  activeMetric === metric.id
                    ? `bg-${metric.color}-100 text-${metric.color}-700 border-2 border-${metric.color}-300`
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                <i className={`${metric.icon} mr-2`}></i>
                {metric.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 數據展示區 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 用戶增長趨勢 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <h4 className="text-lg font-bold flex items-center">
              <i className="ri-user-add-line mr-2"></i>
              用戶增長趨勢
            </h4>
            <p className="text-blue-100 text-sm mt-1">追蹤新用戶註冊情況</p>
          </div>
          
          <div className="p-6">
            {analyticsData.userGrowth.length > 0 ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {analyticsData.userGrowth.reduce((sum, item) => sum + item.count, 0)}
                  </div>
                  <div className="text-sm text-gray-600">新增用戶總數</div>
                </div>
                
                <div className="space-y-2">
                  {analyticsData.userGrowth.slice(-7).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.date}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(item.count / Math.max(...analyticsData.userGrowth.map(d => d.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="ri-user-add-line text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">暫無用戶增長數據</p>
              </div>
            )}
          </div>
        </div>

        {/* 積分流動分析 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
            <h4 className="text-lg font-bold flex items-center">
              <i className="ri-coins-line mr-2"></i>
              積分流動分析
            </h4>
            <p className="text-yellow-100 text-sm mt-1">監控積分發放和使用情況</p>
          </div>
          
          <div className="p-6">
            {analyticsData.pointsFlow.length > 0 ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {analyticsData.pointsFlow.reduce((sum, item) => sum + item.points, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">總發放積分</div>
                </div>
                
                <div className="space-y-2">
                  {analyticsData.pointsFlow.slice(-7).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.date}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${(item.points / Math.max(...analyticsData.pointsFlow.map(d => d.points))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.points.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="ri-coins-line text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">暫無積分流動數據</p>
              </div>
            )}
          </div>
        </div>

        {/* 熱門活動排行 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
            <h4 className="text-lg font-bold flex items-center">
              <i className="ri-calendar-event-line mr-2"></i>
              熱門活動排行
            </h4>
            <p className="text-purple-100 text-sm mt-1">最受歡迎的活動項目</p>
          </div>
          
          <div className="p-6">
            {analyticsData.activityStats.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.activityStats.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-purple-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="ml-3 font-medium text-gray-900">{activity.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">參與次數:</span>
                      <span className="font-bold text-purple-600">{activity.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="ri-calendar-event-line text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">暫無活動參與數據</p>
              </div>
            )}
          </div>
        </div>

        {/* 獎勵兌換統計 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
            <h4 className="text-lg font-bold flex items-center">
              <i className="ri-gift-line mr-2"></i>
              獎勵兌換統計
            </h4>
            <p className="text-orange-100 text-sm mt-1">最受歡迎的獎勵項目</p>
          </div>
          
          <div className="p-6">
            {analyticsData.rewardStats.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.rewardStats.map((reward, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-pink-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="ml-3 font-medium text-gray-900">{reward.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">兌換次數:</span>
                      <span className="font-bold text-orange-600">{reward.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="ri-gift-line text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">暫無獎勵兌換數據</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 用戶參與度總覽 */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <h4 className="text-lg font-bold flex items-center">
            <i className="ri-pulse-line mr-2"></i>
            用戶參與度總覽
          </h4>
          <p className="text-indigo-100 text-sm mt-1">綜合分析用戶活躍度和參與情況</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-calendar-check-line text-2xl text-white"></i>
              </div>
              <div className="text-2xl font-bold text-blue-600">{analyticsData.userEngagement.totalActivities}</div>
              <div className="text-sm text-gray-600 mt-1">總活動參與次數</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-gift-2-line text-2xl text-white"></i>
              </div>
              <div className="text-2xl font-bold text-orange-600">{analyticsData.userEngagement.totalRedemptions}</div>
              <div className="text-sm text-gray-600 mt-1">總獎勵兌換次數</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-percent-line text-2xl text-white"></i>
              </div>
              <div className="text-2xl font-bold text-green-600">{analyticsData.userEngagement.engagementRate}%</div>
              <div className="text-sm text-gray-600 mt-1">用戶參與轉換率</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
