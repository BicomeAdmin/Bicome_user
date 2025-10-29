
import { useState, useEffect, useRef } from 'react';

interface User {
  id: number;
  name: string;
  level: string;
  points: number;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  badge: string;
  joinDate: string;
  achievements: string[];
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  pulseDelay: number;
  orbitSpeed: number;
  initialRadius: number;
}

const EnhancedCommunityCircle = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [hoveredUser, setHoveredUser] = useState<User | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [globalTime, setGlobalTime] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // 25位台灣會員資料
  const communityUsers = [
    {
      id: 1,
      name: '小明',
      level: '鑽石會員',
      points: 15680,
      avatar: 'https://readdy.ai/api/search-image?query=Young%20energetic%20Asian%20businessman%20with%20bright%20smile%20and%20trendy%20glasses%2C%20modern%20creative%20workspace%20background%2C%20casual%20business%20style%20with%20vibrant%20personality%2C%20natural%20warm%20lighting%2C%20contemporary%20professional%20portrait&width=100&height=100&seq=community-user-1&orientation=squarish',
      status: 'online' as const,
      badge: '台北創客',
      joinDate: '2023年3月',
      achievements: ['創新思維', '科技達人', '社群領袖']
    },
    {
      id: 2,
      name: '美玲',
      level: '黃金會員',
      points: 12450,
      avatar: 'https://readdy.ai/api/search-image?query=Stylish%20Asian%20businesswoman%20with%20confident%20smile%20and%20modern%20hairstyle%2C%20colorful%20creative%20studio%20background%2C%20fashionable%20professional%20attire%20with%20artistic%20flair%2C%20soft%20natural%20lighting%2C%20vibrant%20portrait&width=100&height=100&seq=community-user-2&orientation=squarish',
      status: 'online' as const,
      badge: '高雄設計師',
      joinDate: '2023年1月',
      achievements: ['設計專家', '美學大師', '創意無限']
    },
    {
      id: 3,
      name: '志偉',
      level: '白金會員',
      points: 18920,
      avatar: 'https://readdy.ai/api/search-image?query=Tech-savvy%20Asian%20professional%20with%20friendly%20smile%20and%20modern%20glasses%2C%20high-tech%20startup%20office%20with%20neon%20lighting%2C%20casual%20smart%20attire%2C%20futuristic%20background%20elements%2C%20innovative%20personality&width=100&height=100&seq=community-user-3&orientation=squarish',
      status: 'away' as const,
      badge: '台中科技王',
      joinDate: '2022年11月',
      achievements: ['AI專家', '程式天才', '未來領袖']
    },
    {
      id: 4,
      name: '雅婷',
      level: '鑽石會員',
      points: 22340,
      avatar: 'https://readdy.ai/api/search-image?query=Elegant%20Asian%20woman%20with%20warm%20smile%20and%20stylish%20appearance%2C%20luxury%20modern%20office%20with%20plants%20and%20natural%20light%2C%20sophisticated%20business%20casual%20style%2C%20premium%20professional%20environment&width=100&height=100&seq=community-user-4&orientation=squarish',
      status: 'online' as const,
      badge: '桃園商業女王',
      joinDate: '2022年8月',
      achievements: ['商業領袖', '投資達人', '成功典範']
    },
    {
      id: 5,
      name: '建宏',
      level: '黃金會員',
      points: 9870,
      avatar: 'https://readdy.ai/api/search-image?query=Mature%20Asian%20entrepreneur%20with%20confident%20expression%20and%20professional%20appearance%2C%20modern%20co-working%20space%20with%20creative%20elements%2C%20smart%20casual%20business%20attire%2C%20inspiring%20leadership%20presence&width=100&height=100&seq=community-user-5&orientation=squarish',
      status: 'busy' as const,
      badge: '新竹創業家',
      joinDate: '2023年5月',
      achievements: ['創業精神', '領導力', '商業策略']
    },
    {
      id: 6,
      name: '淑芬',
      level: '白金會員',
      points: 16780,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Asian%20woman%20with%20gentle%20smile%20and%20elegant%20style%2C%20beautiful%20cafe%20or%20cultural%20center%20background%2C%20artistic%20and%20cultured%20appearance%2C%20warm%20ambient%20lighting%2C%20sophisticated%20portrait&width=100&height=100&seq=community-user-6&orientation=squarish',
      status: 'online' as const,
      badge: '台南文化達人',
      joinDate: '2023年2月',
      achievements: ['文化推廣', '藝術愛好', '在地專家']
    },
    {
      id: 7,
      name: '俊傑',
      level: '鑽石會員',
      points: 25600,
      avatar: 'https://readdy.ai/api/search-image?query=Young%20Asian%20adventure%20enthusiast%20with%20energetic%20smile%20and%20outdoor%20gear%2C%20beautiful%20coastal%20or%20mountain%20background%2C%20active%20lifestyle%20appearance%2C%20natural%20outdoor%20lighting%2C%20adventurous%20spirit&width=100&height=100&seq=community-user-7&orientation=squarish',
      status: 'online' as const,
      badge: '基隆探險王',
      joinDate: '2022年6月',
      achievements: ['戶外達人', '攝影專家', '自然愛好者']
    },
    {
      id: 8,
      name: '慧君',
      level: '黃金會員',
      points: 11230,
      avatar: 'https://readdy.ai/api/search-image?query=Creative%20Asian%20artist%20with%20inspiring%20smile%20and%20colorful%20paint%20on%20hands%2C%20vibrant%20art%20studio%20with%20paintings%20and%20creative%20tools%2C%20artistic%20clothing%20style%2C%20bright%20creative%20lighting%2C%20passionate%20artist%20portrait&width=100&height=100&seq=community-user-8&orientation=squarish',
      status: 'away' as const,
      badge: '花蓮藝術家',
      joinDate: '2023年4月',
      achievements: ['藝術創作', '色彩大師', '靈感女神']
    },
    {
      id: 9,
      name: '大偉',
      level: '白金會員',
      points: 19450,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Asian%20photographer%20with%20camera%20equipment%20and%20friendly%20expression%2C%20scenic%20mountain%20or%20landscape%20background%2C%20photographer%20vest%20and%20gear%2C%20golden%20hour%20lighting%2C%20artistic%20professional%20portrait&width=100&height=100&seq=community-user-9&orientation=squarish',
      status: 'online' as const,
      badge: '宜蘭攝影師',
      joinDate: '2022年12月',
      achievements: ['視覺藝術', '風景專家', '光影大師']
    },
    {
      id: 10,
      name: '佩君',
      level: '鑽石會員',
      points: 28900,
      avatar: 'https://readdy.ai/api/search-image?query=Sophisticated%20Asian%20executive%20woman%20with%20confident%20smile%20and%20luxury%20business%20attire%2C%20premium%20corporate%20office%20with%20city%20view%2C%20elegant%20professional%20styling%2C%20executive%20presence%20and%20success%20aura&width=100&height=100&seq=community-user-10&orientation=squarish',
      status: 'online' as const,
      badge: '彰化企業家',
      joinDate: '2022年4月',
      achievements: ['企業領導', '財富管理', '商業巨擘']
    },
    {
      id: 11,
      name: '志明',
      level: '黃金會員',
      points: 13670,
      avatar: 'https://readdy.ai/api/search-image?query=Young%20Asian%20maker%20with%20innovative%20smile%20and%20creative%20tools%2C%20modern%20maker%20space%20with%203D%20printers%20and%20electronics%2C%20casual%20tech%20wear%2C%20bright%20innovative%20lighting%2C%20creative%20genius%20portrait&width=100&height=100&seq=community-user-11&orientation=squarish',
      status: 'busy' as const,
      badge: '嘉義創客',
      joinDate: '2023年6月',
      achievements: ['創新製造', '科技創客', '未來工匠']
    },
    {
      id: 12,
      name: '雅雯',
      level: '白金會員',
      points: 17890,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Asian%20agricultural%20expert%20with%20warm%20smile%20and%20straw%20hat%2C%20beautiful%20green%20farm%20or%20greenhouse%20background%2C%20sustainable%20farming%20attire%2C%20natural%20sunlight%2C%20eco-friendly%20lifestyle%20portrait&width=100&height=100&seq=community-user-12&orientation=squarish',
      status: 'online' as const,
      badge: '雲林農業女神',
      joinDate: '2022年9月',
      achievements: ['永續農業', '生態專家', '綠色革命']
    },
    {
      id: 13,
      name: '家豪',
      level: '鑽石會員',
      points: 31200,
      avatar: 'https://readdy.ai/api/search-image?query=Wealthy%20Asian%20investor%20with%20sophisticated%20smile%20and%20premium%20suit%2C%20luxury%20financial%20district%20office%20with%20trading%20screens%2C%20expensive%20watch%20and%20accessories%2C%20success%20and%20wealth%20aura%2C%20premium%20portrait&width=100&height=100&seq=community-user-13&orientation=squarish',
      status: 'away' as const,
      badge: '屏東投資王',
      joinDate: '2022年2月',
      achievements: ['投資專家', '財富密碼', '金融巨頭']
    },
    {
      id: 14,
      name: '欣怡',
      level: '黃金會員',
      points: 14560,
      avatar: 'https://readdy.ai/api/search-image?query=Young%20Asian%20marine%20biologist%20with%20bright%20smile%20and%20snorkeling%20gear%2C%20beautiful%20coral%20reef%20or%20ocean%20background%2C%20marine%20conservation%20attire%2C%20underwater%20photography%20equipment%2C%20ocean%20lover%20portrait&width=100&height=100&seq=community-user-14&orientation=squarish',
      status: 'online' as const,
      badge: '澎湖海洋女神',
      joinDate: '2023年7月',
      achievements: ['海洋保育', '潛水專家', '藍色使命']
    },
    {
      id: 15,
      name: '承翰',
      level: '白金會員',
      points: 20340,
      avatar: 'https://readdy.ai/api/search-image?query=Tech%20genius%20Asian%20developer%20with%20innovative%20smile%20and%20multiple%20monitors%2C%20futuristic%20tech%20lab%20with%20AI%20and%20robotics%20equipment%2C%20cutting-edge%20tech%20clothing%2C%20neon%20lighting%2C%20future%20tech%20portrait&width=100&height=100&seq=community-user-15&orientation=squarish',
      status: 'online' as const,
      badge: '金門AI專家',
      joinDate: '2022年10月',
      achievements: ['AI革命', '機器學習', '科技先鋒']
    },
    {
      id: 16,
      name: '思穎',
      level: '鑽石會員',
      points: 26780,
      avatar: 'https://readdy.ai/api/search-image?query=Trendy%20Asian%20fashion%20designer%20with%20creative%20smile%20and%20designer%20tools%2C%20colorful%20fashion%20studio%20with%20fabric%20and%20sketches%2C%20stylish%20avant-garde%20clothing%2C%20artistic%20lighting%2C%20fashion%20icon%20portrait&width=100&height=100&seq=community-user-16&orientation=squarish',
      status: 'online' as const,
      badge: '馬祖時尚教主',
      joinDate: '2022年7月',
      achievements: ['時尚前沿', '設計革命', '風格教父']
    },
    {
      id: 17,
      name: '宗翰',
      level: '黃金會員',
      points: 15230,
      avatar: 'https://readdy.ai/api/search-image?query=Athletic%20Asian%20fitness%20trainer%20with%20energetic%20smile%20and%20sports%20equipment%2C%20modern%20gym%20or%20outdoor%20training%20facility%2C%20athletic%20wear%20and%20fitness%20gear%2C%20dynamic%20lighting%2C%20health%20and%20fitness%20portrait&width=100&height=100&seq=community-user-17&orientation=squarish',
      status: 'busy' as const,
      badge: '南投健身教練',
      joinDate: '2023年8月',
      achievements: ['健身達人', '體能教練', '運動科學']
    },
    {
      id: 18,
      name: '婉如',
      level: '白金會員',
      points: 21450,
      avatar: 'https://readdy.ai/api/search-image?query=Intellectual%20Asian%20librarian%20with%20gentle%20smile%20and%20surrounded%20by%20books%2C%20beautiful%20traditional%20library%20or%20bookstore%20background%2C%20scholarly%20appearance%20with%20glasses%2C%20warm%20reading%20light%2C%20knowledge%20keeper%20portrait&width=100&height=100&seq=community-user-18&orientation=squarish',
      status: 'online' as const,
      badge: '苗栗知識女神',
      joinDate: '2022年5月',
      achievements: ['博覽群書', '知識分享', '文學造詣']
    },
    {
      id: 19,
      name: '俊宇',
      level: '鑽石會員',
      points: 29870,
      avatar: 'https://readdy.ai/api/search-image?query=Professional%20Asian%20chef%20with%20passionate%20smile%20and%20chef%20hat%2C%20beautiful%20modern%20kitchen%20with%20colorful%20ingredients%20and%20cooking%20tools%2C%20chef%20uniform%20and%20apron%2C%20warm%20kitchen%20lighting%2C%20culinary%20master%20portrait&width=100&height=100&seq=community-user-19&orientation=squarish',
      status: 'away' as const,
      badge: '台東美食之神',
      joinDate: '2022年3月',
      achievements: ['料理藝術', '味覺革命', '美食創新']
    },
    {
      id: 20,
      name: '芷萱',
      level: '黃金會員',
      points: 16890,
      avatar: 'https://readdy.ai/api/search-image?query=Eco-conscious%20Asian%20environmental%20activist%20with%20bright%20smile%20and%20surrounded%20by%20plants%2C%20beautiful%20green%20garden%20or%20eco-friendly%20workspace%2C%20sustainable%20clothing%20style%2C%20natural%20lighting%2C%20environmental%20warrior%20portrait&width=100&height=100&seq=community-user-20&orientation=squarish',
      status: 'online' as const,
      badge: '連江環保戰士',
      joinDate: '2023年9月',
      achievements: ['綠色革命', '環保先鋒', '地球守護者']
    },
    {
      id: 21,
      name: '政宏',
      level: '白金會員',
      points: 23560,
      avatar: 'https://readdy.ai/api/search-image?query=Creative%20Asian%20photographer%20with%20artistic%20smile%20and%20professional%20camera%20equipment%2C%20stunning%20urban%20or%20nature%20photography%20backdrop%2C%20photographer%20vest%20and%20creative%20gear%2C%20golden%20hour%20lighting%2C%20visual%20artist%20portrait&width=100&height=100&seq=community-user-21&orientation=squarish',
      status: 'busy' as const,
      badge: '台北影像大師',
      joinDate: '2022年1月',
      achievements: ['視覺藝術', '光影捕手', '瞬間永恆']
    },
    {
      id: 22,
      name: '怡君',
      level: '鑽石會員',
      points: 32450,
      avatar: 'https://readdy.ai/api/search-image?query=Caring%20Asian%20healthcare%20professional%20with%20warm%20smile%20and%20medical%20attire%2C%20modern%20medical%20facility%20or%20wellness%20center%20background%2C%20professional%20healthcare%20uniform%2C%20soft%20caring%20lighting%2C%20health%20guardian%20portrait&width=100&height=100&seq=community-user-22&orientation=squarish',
      status: 'online' as const,
      badge: '高雄天使醫師',
      joinDate: '2021年12月',
      achievements: ['醫療天使', '健康守護', '生命救星']
    },
    {
      id: 23,
      name: '建成',
      level: '黃金會員',
      points: 18670,
      avatar: 'https://readdy.ai/api/search-image?query=Traditional%20Asian%20cultural%20expert%20with%20wise%20smile%20and%20traditional%20elements%2C%20beautiful%20historic%20temple%20or%20cultural%20heritage%20site%20background%2C%20cultural%20attire%20with%20modern%20touch%2C%20atmospheric%20lighting%2C%20culture%20guardian%20portrait&width=100&height=100&seq=community-user-23&orientation=squarish',
      status: 'away' as const,
      badge: '台中文化使者',
      joinDate: '2023年10月',
      achievements: ['文化傳承', '歷史學者', '傳統智慧']
    },
    {
      id: 24,
      name: '詩涵',
      level: '白金會員',
      points: 24780,
      avatar: 'https://readdy.ai/api/search-image?query=Talented%20Asian%20musician%20with%20joyful%20smile%20and%20musical%20instruments%2C%20beautiful%20concert%20hall%20or%20music%20studio%20background%2C%20elegant%20musical%20attire%2C%20warm%20stage%20lighting%2C%20musical%20genius%20portrait&width=100&height=100&seq=community-user-24&orientation=squarish',
      status: 'online' as const,
      badge: '桃園音樂女神',
      joinDate: '2022年11月',
      achievements: ['音樂才華', '旋律魔法', '聲音天使']
    },
    {
      id: 25,
      name: '宇軒',
      level: '鑽石會員',
      points: 35600,
      avatar: 'https://readdy.ai/api/search-image?query=Visionary%20Asian%20tech%20leader%20with%20confident%20smile%20and%20futuristic%20technology%2C%20cutting-edge%20tech%20company%20office%20with%20holographic%20displays%2C%20premium%20business%20attire%2C%20innovative%20lighting%2C%20tech%20visionary%20portrait&width=100&height=100&seq=community-user-25&orientation=squarish',
      status: 'online' as const,
      badge: '新竹科技教父',
      joinDate: '2021年8月',
      achievements: ['科技遠見', '創新引領', '未來架構師']
    }
  ];

  // 監聽容器尺寸變化
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!containerRef.current || containerSize.width === 0 || containerSize.height === 0) return;

    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 100; // 增加邊距

    // 創建多層圓形分佈
    const initialUsers = communityUsers.map((user, index) => {
      const totalUsers = communityUsers.length;
      const layerCount = 4; // 4層圓圈
      const usersPerLayer = Math.ceil(totalUsers / layerCount);
      const currentLayer = Math.floor(index / usersPerLayer);
      const indexInLayer = index % usersPerLayer;
      const usersInCurrentLayer = Math.min(usersPerLayer, totalUsers - currentLayer * usersPerLayer);
      
      // 計算半徑 - 從內到外
      const layerRadius = maxRadius * (0.3 + (currentLayer / (layerCount - 1)) * 0.6);
      
      // 計算角度 - 均勻分佈
      const angleStep = (2 * Math.PI) / usersInCurrentLayer;
      const angle = indexInLayer * angleStep + (currentLayer * Math.PI / 8); // 每層稍微偏移
      
      // 添加隨機偏移讓分佈更自然
      const randomOffset = (Math.random() - 0.5) * 40;
      const finalRadius = layerRadius + randomOffset;
      
      const x = centerX + Math.cos(angle) * finalRadius;
      const y = centerY + Math.sin(angle) * finalRadius;
      
      return {
        ...user,
        x,
        y,
        vx: 0,
        vy: 0,
        angle,
        radius: finalRadius,
        pulseDelay: Math.random() * 2000,
        orbitSpeed: 0.0002 + Math.random() * 0.0004,
        initialRadius: finalRadius
      };
    });

    setUsers(initialUsers);

    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      setGlobalTime(currentTime);
      
      setUsers(prevUsers => 
        prevUsers.map(user => {
          const orbitProgress = currentTime * user.orbitSpeed;
          const targetX = centerX + Math.cos(user.angle + orbitProgress) * user.initialRadius;
          const targetY = centerY + Math.sin(user.angle + orbitProgress) * user.initialRadius;
          
          // 平滑移動
          const smoothFactor = 0.02;
          let newX = user.x + (targetX - user.x) * smoothFactor;
          let newY = user.y + (targetY - user.y) * smoothFactor;
          
          // 添加微妙的呼吸效果
          const breathe = Math.sin(currentTime * 0.001 + user.pulseDelay * 0.001) * 3;
          newX += breathe;
          newY += breathe * 0.5;
          
          // 邊界檢查
          const distFromCenter = Math.sqrt(Math.pow(newX - centerX, 2) + Math.pow(newY - centerY, 2));
          const maxBoundary = Math.min(centerX, centerY) - 80;
          
          if (distFromCenter > maxBoundary) {
            const angle = Math.atan2(newY - centerY, newX - centerX);
            newX = centerX + Math.cos(angle) * maxBoundary;
            newY = centerY + Math.sin(angle) * maxBoundary;
          }

          return {
            ...user,
            x: newX,
            y: newY
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerSize]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'away': return 'bg-gradient-to-r from-yellow-400 to-amber-500';
      case 'busy': return 'bg-gradient-to-r from-red-400 to-rose-500';
      default: return 'bg-gradient-to-r from-gray-400 to-slate-500';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '鑽石會員': return 'from-blue-500 via-purple-500 to-pink-500';
      case '黃金會員': return 'from-yellow-400 via-orange-500 to-red-500';
      case '白金會員': return 'from-slate-400 via-purple-400 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case '鑽石會員': return 'ri-vip-diamond-fill';
      case '黃金會員': return 'ri-vip-crown-fill';
      case '白金會員': return 'ri-medal-fill';
      default: return 'ri-user-line';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[700px] cursor-pointer overflow-hidden bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 rounded-3xl border border-slate-200/50 shadow-xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredUser(null)}
    >
      {/* 背景軌道線 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <radialGradient id="orbitGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        {[0.3, 0.5, 0.7, 0.9].map((scale, index) => (
          <circle
            key={index}
            cx="50%"
            cy="50%"
            r={`${30 * scale}%`}
            fill="none"
            stroke="url(#orbitGradient)"
            strokeWidth="1"
            strokeDasharray="5,10"
            opacity={0.4 - index * 0.08}
          />
        ))}
      </svg>

      {/* 用戶頭像 */}
      {users.map((user) => {
        const isHovered = hoveredUser?.id === user.id;
        const scale = isHovered ? 1.4 : 1;
        const pulsePhase = (globalTime + user.pulseDelay) * 0.003;
        const pulseScale = 1 + Math.sin(pulsePhase) * 0.03;
        
        return (
          <div
            key={user.id}
            className="absolute transition-all duration-500 ease-out group"
            style={{
              left: user.x - 32,
              top: user.y - 32,
              transform: `scale(${scale * pulseScale})`,
              zIndex: isHovered ? 100 : 10 + Math.floor(user.points / 1000)
            }}
            onMouseEnter={() => setHoveredUser(user)}
          >
            {/* 懸停時的魔法光環 */}
            {isHovered && (
              <>
                <div className="absolute inset-0 animate-ping">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getLevelColor(user.level)} opacity-30 rounded-full blur-sm`}></div>
                </div>
                <div className="absolute inset-0 animate-pulse">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getLevelColor(user.level)} opacity-20 rounded-full blur-lg scale-150`}></div>
                </div>
                {/* 粒子效果 */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-ping opacity-60"
                    style={{
                      left: `${32 + Math.cos(i * Math.PI / 4) * 40}px`,
                      top: `${32 + Math.sin(i * Math.PI / 4) * 40}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '1.5s'
                    }}
                  ></div>
                ))}
              </>
            )}
            
            {/* 主要頭像容器 */}
            <div className="relative w-16 h-16">
              {/* 外層等級光環 */}
              <div className={`absolute inset-0 bg-gradient-to-r ${getLevelColor(user.level)} rounded-full p-1 shadow-2xl ${isHovered ? 'animate-pulse' : ''}`}>
                <div className="w-full h-full bg-white rounded-full p-1 shadow-inner">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover shadow-lg"
                    style={{
                      filter: isHovered ? 'brightness(1.1) contrast(1.1) saturate(1.2)' : 'none'
                    }}
                  />
                </div>
              </div>
              
              {/* 在線狀態指示器 */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(user.status)} rounded-full border-3 border-white shadow-lg ${user.status === 'online' ? 'animate-pulse' : ''}`}>
                <div className="absolute inset-1 bg-white/30 rounded-full animate-ping"></div>
              </div>
              
              {/* 等級徽章 */}
              <div className={`absolute -top-2 -left-2 w-7 h-7 bg-gradient-to-r ${getLevelColor(user.level)} rounded-full flex items-center justify-center shadow-xl border-2 border-white transform ${isHovered ? 'scale-110 rotate-12' : ''} transition-all duration-300`}>
                <i className={`${getLevelIcon(user.level)} text-white text-sm drop-shadow-sm`}></i>
              </div>

              {/* 積分徽章 */}
              {user.points > 20000 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold text-white">
                  ★
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* 動態連接線效果 */}
      <svg className="absolute inset-0 pointer-events-none">
        {users.map((user, index) => 
          users.slice(index + 1).map((otherUser, otherIndex) => {
            const distance = Math.sqrt(
              Math.pow(user.x - otherUser.x, 2) + Math.pow(user.y - otherUser.y, 2)
            );
            
            if (distance < 120) {
              const opacity = Math.max(0, (120 - distance) / 120) * 0.3;
              const isSpecialConnection = user.level === otherUser.level;
              
              return (
                <line
                  key={`${index}-${otherIndex}`}
                  x1={user.x}
                  y1={user.y}
                  x2={otherUser.x}
                  y2={otherUser.y}
                  stroke={isSpecialConnection ? "url(#specialConnectionGradient)" : "url(#connectionGradient)"}
                  strokeWidth={isSpecialConnection ? "2" : "1"}
                  opacity={opacity}
                  className={isSpecialConnection ? "animate-pulse" : ""}
                />
              );
            }
            return null;
          })
        )}
        
        {/* 增強的漸層定義 */}
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="specialConnectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* 增強的用戶資訊卡片 */}
      {hoveredUser && (
        <div
          className="fixed z-50 pointer-events-none transition-all duration-300"
          style={{
            left: Math.min(mousePos.x + 20, window.innerWidth - 380),
            top: Math.max(mousePos.y - 150, 20)
          }}
        >
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-6 w-96 transform animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* 用戶基本資訊 */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className={`w-20 h-20 bg-gradient-to-r ${getLevelColor(hoveredUser.level)} rounded-2xl p-1 shadow-xl`}>
                  <img
                    src={hoveredUser.avatar}
                    alt={hoveredUser.name}
                    className="w-full h-full rounded-xl object-cover"
                  />
                </div>
                <div className={`absolute -bottom-2 -right-2 w-6 h-6 ${getStatusColor(hoveredUser.status)} rounded-full border-3 border-white shadow-lg`}></div>
                <div className={`absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r ${getLevelColor(hoveredUser.level)} rounded-full flex items-center justify-center shadow-xl border-2 border-white`}>
                  <i className={`${getLevelIcon(hoveredUser.level)} text-white text-sm`}></i>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{hoveredUser.name}</h3>
                <p className="text-sm text-slate-600 mb-2">{hoveredUser.level}</p>
                <div className="flex items-center space-x-2">
                  <div className={`px-4 py-2 bg-gradient-to-r ${getLevelColor(hoveredUser.level)} bg-opacity-10 rounded-full`}>
                    <span className="text-xs font-bold text-slate-800">{hoveredUser.badge}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 積分資訊 */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-5 mb-5 border border-blue-100 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600 font-medium">總積分</span>
                <span className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {hoveredUser.points.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <i className="ri-calendar-line text-slate-500 text-sm"></i>
                <span className="text-xs text-slate-500">加入於 {hoveredUser.joinDate}</span>
              </div>
              <div className="w-full bg-white/70 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((hoveredUser.points / 40000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* 成就徽章 */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                <i className="ri-trophy-line text-yellow-500 mr-2"></i>
                專屬成就
              </h4>
              <div className="flex flex-wrap gap-2">
                {hoveredUser.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 bg-gradient-to-r from-slate-100 via-white to-slate-100 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-xs font-semibold text-slate-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 底部裝飾 */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium">活躍中</span>
                </div>
                <div className="text-slate-500 text-xs">
                  #{hoveredUser.id.toString().padStart(4, '0')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedCommunityCircle;
