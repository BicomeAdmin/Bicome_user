
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 檢查是否已登入
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      try {
        const userData = JSON.parse(userSession);
        setUser(userData);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('解析用戶會話失敗:', error);
        localStorage.removeItem('userSession');
      }
    }
  }, [navigate]);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    navigate('/dashboard', { replace: true });
  };

  const handleRegisterSuccess = (userData: any) => {
    setUser(userData);
    navigate('/dashboard', { replace: true });
  };

  // 處理今日簽到按鈕點擊
  const handleDailyCheckIn = () => {
    // 檢查是否已登入
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      // 如果已登入，直接跳轉到儀表板
      navigate('/dashboard', { replace: true });
    } else {
      // 如果未登入，顯示提示並切換到登入表單
      alert('請先登入以完成今日簽到！');
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        {/* 品牌標題 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl font-bold">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">台灣社群圈</h1>
          <p className="text-gray-600">您的專屬積分獎勵平台</p>
        </div>

        {/* 切換標籤 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 mb-6 shadow-lg border border-white/50">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsLogin(true)}
              className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                isLogin
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              登入
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              註冊
            </button>
          </div>
        </div>

        {/* 表單內容 */}
        <div className="transition-all duration-500 ease-in-out">
          {isLogin ? (
            <LoginForm
              onLoginSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setIsLogin(false)}
              onDailyCheckIn={handleDailyCheckIn}
            />
          ) : (
            <RegisterForm
              onRegisterSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>使用即表示您同意我們的</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="hover:text-blue-600 transition-colors">服務條款</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition-colors">隱私政策</a>
          </div>
        </div>
      </div>
    </div>
  );
}
