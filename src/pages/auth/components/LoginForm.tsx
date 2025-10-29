
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase-singleton';

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
  onSwitchToRegister: () => void;
  onDailyCheckIn?: () => void;
}

export default function LoginForm({ onLoginSuccess, onSwitchToRegister, onDailyCheckIn }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        setError('登入失敗：用戶不存在');
        setLoading(false);
        return;
      }

      if (password !== 'password123' && password !== '123456') {
        setError('登入失敗：密碼錯誤');
        setLoading(false);
        return;
      }

      // 統一使用 'user' 作為 localStorage 鍵值
      const userSession = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        total_points: userData.total_points || 100,
        level: userData.level || 'Bronze',
        avatar_url: userData.avatar_url || '',
        streak_days: userData.streak_days || 3,
        weekly_goal: userData.weekly_goal || 100,
        weekly_progress: userData.weekly_progress || 60,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        last_login_at: new Date().toISOString()
      };
      
      // 同時存儲兩個鍵值以確保兼容性
      localStorage.setItem('user', JSON.stringify(userSession));
      localStorage.setItem('userSession', JSON.stringify(userSession));

      onLoginSuccess(userSession);
      
      // 延遲導航確保狀態更新完成
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (error) {
      console.error('登入錯誤:', error);
      setError('登入過程中發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (userEmail: string) => {
    setLoading(true);
    setError('');
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (userError || !userData) {
        setError('快速登入失敗：用戶不存在');
        setLoading(false);
        return;
      }

      // 統一使用 'user' 作為 localStorage 鍵值
      const userSession = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        total_points: userData.total_points || 100,
        level: userData.level || 'Bronze',
        avatar_url: userData.avatar_url || '',
        streak_days: userData.streak_days || 3,
        weekly_goal: userData.weekly_goal || 100,
        weekly_progress: userData.weekly_progress || 60,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        last_login_at: new Date().toISOString()
      };
      
      // 同時存儲兩個鍵值以確保兼容性
      localStorage.setItem('user', JSON.stringify(userSession));
      localStorage.setItem('userSession', JSON.stringify(userSession));

      onLoginSuccess(userSession);
      
      // 延遲導航確保狀態更新完成
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (error) {
      console.error('快速登入錯誤:', error);
      setError('快速登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <i className="ri-error-warning-line text-red-500 mr-2"></i>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            電子郵件
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-mail-line text-gray-400"></i>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="請輸入您的電子郵件"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            密碼
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-lock-line text-gray-400"></i>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="請輸入您的密碼"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">測試密碼：password123 或 123456</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              登入中...
            </div>
          ) : (
            '立即登入'
          )}
        </button>
      </form>

      {/* 快速登入 */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">快速登入測試帳號</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={() => quickLogin('sarah.wang@email.com')}
            disabled={loading}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-white hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <i className="ri-user-line text-blue-600"></i>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 text-sm">王淑芬</div>
                <div className="text-xs text-gray-500">sarah.wang@email.com</div>
              </div>
            </div>
            <i className="ri-arrow-right-line text-gray-400 group-hover:text-blue-600 transition-colors"></i>
          </button>
          
          <button
            onClick={() => quickLogin('john.doe@email.com')}
            disabled={loading}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-white hover:bg-green-50 hover:border-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <i className="ri-user-line text-green-600"></i>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 text-sm">約翰</div>
                <div className="text-xs text-gray-500">john.doe@email.com</div>
              </div>
            </div>
            <i className="ri-arrow-right-line text-gray-400 group-hover:text-green-600 transition-colors"></i>
          </button>

          <button
            onClick={() => quickLogin('jane.smith@email.com')}
            disabled={loading}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-white hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <i className="ri-user-line text-purple-600"></i>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 text-sm">珍妮</div>
                <div className="text-xs text-gray-500">jane.smith@email.com</div>
              </div>
            </div>
            <i className="ri-arrow-right-line text-gray-400 group-hover:text-purple-600 transition-colors"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
