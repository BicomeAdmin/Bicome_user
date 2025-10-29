
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface RegisterFormProps {
  onRegisterSuccess: (user: any) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '123456',
    confirmPassword: '123456'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('請輸入姓名');
      return false;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      setError('請至少輸入電子信箱或手機號碼其中一項');
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('請輸入正確的電子信箱格式');
      return false;
    }

    if (formData.phone && !/^09\d{8}$/.test(formData.phone)) {
      setError('請輸入正確的手機號碼格式（09開頭，共10位數字）');
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, phone')
        .or(`email.eq.${formData.email || 'null'},phone.eq.${formData.phone || 'null'}`)
        .single();

      if (existingUser) {
        if (existingUser.email === formData.email) {
          setError('此電子信箱已被註冊');
        } else if (existingUser.phone === formData.phone) {
          setError('此手機號碼已被註冊');
        }
        return;
      }

      const newUser = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        level: 'Bronze',
        total_points: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString()
      };

      const { data: userData, error: insertError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const userSession = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        level: userData.level,
        total_points: userData.total_points,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('userSession', JSON.stringify(userSession));
      onRegisterSuccess(userSession);
      
    } catch (error) {
      console.error('註冊失敗:', error);
      setError('註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-6">
      <form onSubmit={handleRegister} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
            <i className="ri-error-warning-line text-red-500 mr-2"></i>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            姓名 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-user-line text-gray-400"></i>
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="請輸入您的姓名"
              maxLength={50}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            電子信箱
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-mail-line text-gray-400"></i>
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="請輸入電子信箱（選填）"
              maxLength={100}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            手機號碼
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="ri-phone-line text-gray-400"></i>
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="請輸入手機號碼（選填）"
              maxLength={10}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">格式：09開頭，共10位數字</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <i className="ri-information-line text-blue-600 mr-2"></i>
            <span className="text-sm font-medium text-blue-800">密碼設定</span>
          </div>
          <p className="text-xs text-blue-700 mb-3">
            為方便測試，所有帳號密碼統一設定為：123456
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">密碼</label>
              <input
                type="password"
                value={formData.password}
                disabled
                className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-blue-100 text-blue-700 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">確認密碼</label>
              <input
                type="password"
                value={formData.confirmPassword}
                disabled
                className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-blue-100 text-blue-700 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="ri-gift-line text-green-600 mr-2"></i>
            <div>
              <p className="text-sm font-medium text-green-800">註冊獎勵</p>
              <p className="text-xs text-green-700">完成註冊即可獲得 100 積分獎勵！</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.name.trim() || (!formData.email.trim() && !formData.phone.trim())}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              註冊中...
            </span>
          ) : (
            '立即註冊'
          )}
        </button>
      </form>
    </div>
  );
}
