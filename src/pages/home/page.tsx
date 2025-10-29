
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EnhancedCommunityCircle from './components/TaiwanCommunityCircle';

const HomePage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: '10K+', label: '活躍用戶', icon: 'ri-user-line' },
    { value: '500+', label: '合作商家', icon: 'ri-store-line' },
    { value: '95%', label: '滿意度', icon: 'ri-heart-line' },
    { value: '24/7', label: '全天服務', icon: 'ri-time-line' }
  ];

  const features = [
    {
      icon: 'ri-trophy-line',
      title: '智能積分系統',
      description: '完成各種任務獲得積分，兌換豐富獎品，讓每一次參與都有價值回報',
      color: 'blue'
    },
    {
      icon: 'ri-gift-line',
      title: '專屬會員權益',
      description: '享受VIP級別的專屬優惠、優先體驗權和個人化服務推薦',
      color: 'purple'
    },
    {
      icon: 'ri-community-line',
      title: '社群互動平台',
      description: '與志同道合的夥伴交流分享，參與精彩活動，建立有意義的連結',
      color: 'green'
    }
  ];

  const testimonials = [
    {
      name: '張小明',
      role: '資深會員',
      content: '這個平台完全改變了我的生活方式，積分系統設計得非常有趣，獎勵也很實用！',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20young%20Asian%20man%20smiling%20confidently%20in%20modern%20office%20environment%20with%20natural%20lighting%20and%20contemporary%20background%2C%20business%20casual%20attire%2C%20warm%20friendly%20expression%2C%20high-quality%20portrait%20photography%20style&width=80&height=80&seq=user-avatar-male-1&orientation=squarish'
    },
    {
      name: '李美華',
      role: '活躍用戶',
      content: '社群功能讓我認識了很多朋友，活動豐富多彩，每天都有新的驚喜等著我！',
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20young%20Asian%20woman%20with%20bright%20smile%20in%20contemporary%20workplace%20setting%2C%20natural%20lighting%2C%20modern%20business%20casual%20style%2C%20confident%20and%20approachable%20expression%2C%20premium%20portrait%20quality&width=80&height=80&seq=user-avatar-female-1&orientation=squarish'
    },
    {
      name: '王大成',
      role: '忠實粉絲',
      content: '會員權益真的很棒，客服團隊專業又貼心，讓我感受到被重視的感覺！',
      avatar: 'https://readdy.ai/api/search-image?query=Mature%20Asian%20businessman%20with%20warm%20smile%20in%20sophisticated%20office%20environment%2C%20professional%20attire%2C%20natural%20lighting%2C%20confident%20and%20trustworthy%20appearance%2C%20high-end%20portrait%20photography&width=80&height=80&seq=user-avatar-male-2&orientation=squarish'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="ri-trophy-line text-white text-xl"></i>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">RewardHub</div>
                <div className="text-xs text-gray-500">智能獎勵生態系統</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                功能特色
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                用戶見證
              </a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors cursor-pointer">
                聯絡我們
              </a>
              <Link
                to="/auth"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                立即開始
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-20 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center">
            {/* 主標題區域 */}
            <div className={`space-y-8 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="space-y-6">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-blue-700 font-semibold text-sm">全新智能獎勵生態系統</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900">
                  智能獎勵
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    新體驗
                  </span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  參與各種精彩活動，累積積分獲得豐富獎勵。與志同道合的夥伴建立連結，享受專屬會員權益，開啟全新的智能生活體驗！
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg whitespace-nowrap cursor-pointer transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  立即加入獎勵計劃
                </Link>
                <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg whitespace-nowrap cursor-pointer transition-all duration-300 hover:bg-gray-50">
                  了解更多功能
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 transform transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group">
                  <i className={`${stat.icon} text-3xl text-blue-600 mb-3 group-hover:scale-110 transition-transform`}></i>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* 儀表板預覽 */}
            <div className={`mt-20 transform transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 p-8 max-w-4xl mx-auto relative overflow-hidden">
                {/* 背景裝飾 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
                
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <i className="ri-dashboard-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">會員儀表板</h3>
                      <p className="text-gray-600">歡迎回來，王小明！</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600 text-sm font-medium">在線</span>
                  </div>
                </div>

                {/* Points Display */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-bold text-blue-600 mb-2">2,847</div>
                      <div className="text-gray-600 font-medium">目前積分</div>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <i className="ri-coin-line text-white text-2xl"></i>
                    </div>
                  </div>
                  <div className="mt-4 bg-white rounded-full h-3 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-2000" style={{ width: '68%' }}></div>
                  </div>
                  <div className="mt-3 text-gray-600 text-sm font-medium">距離下一級還需 653 分</div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-xl p-4 text-center transition-all duration-300 group">
                    <i className="ri-task-line text-2xl text-green-600 mb-3 group-hover:scale-110 transition-transform"></i>
                    <div className="font-semibold text-gray-900">完成任務</div>
                    <div className="text-xs text-green-600 mt-1">+50 積分</div>
                  </button>
                  <button className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-xl p-4 text-center transition-all duration-300 group">
                    <i className="ri-gift-line text-2xl text-purple-600 mb-3 group-hover:scale-110 transition-transform"></i>
                    <div className="font-semibold text-gray-900">兌換獎勵</div>
                    <div className="text-xs text-purple-600 mt-1">精選商品</div>
                  </button>
                </div>

                {/* Recent Activities */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg">最近活動</h4>
                  {[
                    { icon: 'ri-calendar-check-line', title: '每日簽到', points: '+10', color: 'blue' },
                    { icon: 'ri-share-line', title: '分享成就', points: '+15', color: 'green' },
                    { icon: 'ri-user-add-line', title: '邀請朋友', points: '+30', color: 'purple' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className={`w-10 h-10 bg-${activity.color}-100 rounded-lg flex items-center justify-center`}>
                        <i className={`${activity.icon} text-${activity.color}-600`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{activity.title}</div>
                        <div className="text-gray-500 text-xs">剛剛完成</div>
                      </div>
                      <div className="text-green-600 font-bold text-sm">{activity.points}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community Circle Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 rounded-full mb-6">
              <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
              <span className="text-blue-700 font-semibold">溫暖社群圈</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              發現我們的
              <span className="text-blue-600"> 活躍圈子</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              在這個充滿活力的社群中，每位會員都有自己的故事。將滑鼠移到會員頭像上，探索他們的專屬成就與經歷
            </p>
          </div>

          {/* Community Circle */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <EnhancedCommunityCircle />
          </div>

          {/* Community Stats */}
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            {[
              { label: '在線會員', value: '2,847', icon: 'ri-user-heart-line', color: 'green' },
              { label: '資深會員', value: '1,256', icon: 'ri-vip-crown-2-line', color: 'blue' },
              { label: '新進會員', value: '892', icon: 'ri-user-add-line', color: 'purple' },
              { label: '互動熱度', value: '98%', icon: 'ri-fire-line', color: 'orange' }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-all duration-300 group">
                <div className={`w-14 h-14 bg-${stat.color}-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <i className={`${stat.icon} text-${stat.color}-600 text-xl`}></i>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gray-100 rounded-full mb-6">
              <span className="text-gray-700 font-semibold">核心功能</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">為什麼選擇我們</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              結合最先進的獎勵機制、社群互動和個人化體驗，打造專屬於您的智能生活平台
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:shadow-2xl hover:border-gray-200 transition-all duration-300 group">
                <div className="text-center">
                  <div className={`w-20 h-20 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`${feature.icon} text-3xl text-${feature.color}-600`}></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-8">{feature.description}</p>
                  <button className="bg-gray-900 hover:bg-gray-800 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap hover:shadow-lg transform hover:scale-105">
                    立即體驗
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-white rounded-full border border-gray-200 mb-6">
              <span className="text-gray-700 font-semibold">用戶見證</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">用戶真實體驗分享</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              聽聽來自真實用戶的聲音，了解我們如何改變他們的生活體驗
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-200 mr-4 group-hover:scale-110 transition-transform"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex space-x-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className="ri-star-fill text-yellow-400 text-lg"></i>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            準備好開始您的積分之旅了嗎？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            立即加入我們的智能獎勵生態系統，享受專屬會員權益，開啟全新的數位生活體驗
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/auth')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              立即註冊
            </button>
            <button 
              onClick={() => navigate('/auth')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 cursor-pointer whitespace-nowrap"
            >
              會員登入
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <i className="ri-trophy-line text-white text-xl"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">RewardHub</div>
                  <div className="text-gray-600">智能獎勵生態系統</div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6 max-w-md">
                結合積分獎勵、社群互動和會員權益，為用戶打造全新的智能生活體驗平台
              </p>
              <div className="flex space-x-3">
                <button className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer">
                  <i className="ri-facebook-line text-gray-600"></i>
                </button>
                <button className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer">
                  <i className="ri-twitter-line text-gray-600"></i>
                </button>
                <button className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer">
                  <i className="ri-instagram-line text-gray-600"></i>
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-gray-900">快速連結</h3>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link to="/auth" className="hover:text-gray-900 transition-colors cursor-pointer">
                    會員中心
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-gray-900 transition-colors cursor-pointer">
                    功能介紹
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-gray-900 transition-colors cursor-pointer">
                    用戶見證
                  </a>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-gray-900 transition-colors cursor-pointer">
                    管理後台
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-gray-900">聯絡資訊</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center space-x-3">
                  <i className="ri-mail-line text-gray-500"></i>
                  <span>support@rewardhub.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <i className="ri-phone-line text-gray-500"></i>
                  <span>+886 2 1234 5678</span>
                </li>
                <li className="flex items-center space-x-3">
                  <i className="ri-time-line text-gray-500"></i>
                  <span>24/7 客服支援</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">
              © 2024 RewardHub. All rights reserved.
            </p>
            <div className="flex space-x-6 text-gray-500">
              <a href="#" className="hover:text-gray-700 transition-colors cursor-pointer">
                隱私政策
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors cursor-pointer">
                服務條款
              </a>
              <a href="https://readdy.ai/?origin=logo" className="hover:text-gray-700 transition-colors cursor-pointer">
                Website Builder
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
