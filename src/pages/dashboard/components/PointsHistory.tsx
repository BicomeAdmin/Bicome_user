
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase-singleton';

interface PointsHistoryProps {
  userId: string;
  currentProjectId: string;
  user?: any;
  selectedProject?: any;
  onClose?: () => void;
  isModal?: boolean;
}

export default function PointsHistory({ userId, currentProjectId, user, selectedProject, onClose, isModal = false }: PointsHistoryProps) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, earned, spent

  // 當用戶或專案改變時重新載入數據
  useEffect(() => {
    if (userId && currentProjectId) {
      fetchPointsHistory();
    }
  }, [userId, currentProjectId, filter]);

  // 監聽積分更新事件
  useEffect(() => {
    const handlePointsUpdate = () => {
      console.log('PointsHistory 收到積分更新事件，重新載入交易記錄');
      fetchPointsHistory();
    };
    window.addEventListener('pointsUpdated', handlePointsUpdate);
    return () => window.removeEventListener('pointsUpdated', handlePointsUpdate);
  }, [userId, currentProjectId, filter]);

  const fetchPointsHistory = async () => {
    if (!userId || !currentProjectId) return;

    setLoading(true);
    try {
      console.log(`載入積分記錄 - 用戶: ${userId}, 專案: ${currentProjectId}`);

      // 檢查專案ID是否為有效UUID格式
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(currentProjectId);
      
      if (!isValidUUID) {
        console.log('專案ID不是有效UUID，使用預設數據');
        setTransactions([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', currentProjectId)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('transaction_type', filter);
      }

      const { data: transactionData, error: transactionError } = await query;

      if (transactionError) {
        console.error('Error fetching point transactions:', transactionError);
        setTransactions([]);
      } else {
        console.log(`找到 ${transactionData?.length || 0} 筆交易記錄`);
        setTransactions(transactionData || []);
      }

    } catch (error) {
      console.error('Error fetching points history:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string, points: number) => {
    if (type === 'earned' || points > 0) {
      return 'ri-add-circle-line';
    } else {
      return 'ri-subtract-line';
    }
  };

  const getTransactionColor = (type: string, points: number) => {
    if (type === 'earned' || points > 0) {
      return 'text-green-600 bg-green-100';
    } else {
      return 'text-red-600 bg-red-100';
    }
  };

  const content = (
    <div className={`${isModal ? '' : 'bg-white/80 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl border border-white/50'} p-4 md:p-6`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center mb-3 md:mb-0">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <i className="ri-history-line text-white text-base md:text-lg"></i>
          </div>
          積分記錄
        </h3>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer"
          >
            <i className="ri-close-line text-lg md:text-xl"></i>
          </button>
        )}
      </div>

      {/* 篩選器 */}
      <div className="flex space-x-2 mb-4 md:mb-6 overflow-x-auto">
        {[
          { key: 'all', label: '全部', icon: 'ri-list-check' },
          { key: 'earned', label: '獲得', icon: 'ri-add-circle-line' },
          { key: 'spent', label: '消費', icon: 'ri-subtract-line' }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
              filter === filterOption.key
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className={filterOption.icon}></i>
            <span>{filterOption.label}</span>
          </button>
        ))}
      </div>

      {/* 交易記錄列表 */}
      <div className="space-y-3 max-h-80 md:max-h-96 overflow-y-auto">
        {loading ? (
          // 載入動畫
          [1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 md:h-4 bg-gray-200 rounded w-24 md:w-32 mb-2"></div>
                <div className="h-2 md:h-3 bg-gray-200 rounded w-16 md:w-24"></div>
              </div>
              <div className="h-4 md:h-6 bg-gray-200 rounded w-12 md:w-16"></div>
            </div>
          ))
        ) : transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <div key={transaction.id || index} className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${getTransactionColor(transaction.transaction_type, transaction.points)}`}>
                <i className={`${getTransactionIcon(transaction.transaction_type, transaction.points)} text-base md:text-lg`}></i>
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm md:text-base">{transaction.description}</p>
                <p className="text-xs md:text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
              </div>
              
              <div className="text-right">
                <p className={`font-bold text-base md:text-lg ${
                  transaction.transaction_type === 'earned' || transaction.points > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {transaction.transaction_type === 'earned' || transaction.points > 0 ? '+' : ''}{transaction.points}
                </p>
                <p className="text-xs text-gray-500">積分</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 md:py-12">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-history-line text-gray-400 text-xl md:text-2xl"></i>
            </div>
            <p className="text-gray-500 text-sm md:text-base">此專案暫無積分記錄</p>
            <p className="text-xs md:text-sm text-gray-400 mt-2">完成活動後會顯示積分獲得記錄</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
