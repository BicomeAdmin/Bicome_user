
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  total_points: number;
  level: string;
  created_at: string;
  experience_points?: number;
  is_active?: boolean;
  joined_at?: string;
}

interface UserManagementProps {
  /** The project identifier. Use `'all'` to fetch every user. */
  selectedProject: string;
}

/**
 * UserManagement component – lists, searches, filters and sorts users.
 *
 * The component fetches data from Supabase based on the `selectedProject` prop.
 * It safely handles loading and error states and provides a small UI for
 * interaction.
 */
export default function UserManagement({ selectedProject }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'points' | 'level' | 'date'>('points');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  /** Fetch users whenever the selected project changes. */
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);

  /**
   * Retrieves users (either all users or users belonging to a specific project)
   * and merges any project‑specific data (points, level, etc.) into the final
   * user objects.
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch all users if the project filter is "all"
      if (selectedProject === 'all') {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('total_points', { ascending: false });

        if (usersError) {
          console.error('Error fetching users:', usersError);
          setUsers([]);
          return;
        }

        setUsers(usersData ?? []);
        return;
      }

      // 2️⃣ Otherwise fetch the relationship rows for the specific project
      const {
        data: userProjectsData,
        error: userProjectsError,
      } = await supabase
        .from('user_projects')
        .select(
          'user_id, total_points, experience_points, joined_at, is_active, level_tier'
        )
        .eq('project_id', selectedProject);

      if (userProjectsError) {
        console.error('Error fetching user projects:', userProjectsError);
        setUsers([]);
        return;
      }

      if (!userProjectsData?.length) {
        setUsers([]);
        return;
      }

      // 3️⃣ Get the detailed user rows for the IDs we just retrieved
      const userIds = userProjectsData.map((up) => up.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users details:', usersError);
        setUsers([]);
        return;
      }

      // 4️⃣ Merge the project‑specific fields into the core user object
      const combinedUsers: User[] =
        usersData?.map((user) => {
          const projectInfo = userProjectsData.find(
            (up) => up.user_id === user.id
          );

          return {
            ...user,
            total_points: projectInfo?.total_points ?? user.total_points ?? 0,
            experience_points:
              projectInfo?.experience_points ?? user.experience_points ?? 0,
            joined_at: projectInfo?.joined_at ?? user.created_at,
            is_active: projectInfo?.is_active ?? true,
            level:
              projectInfo?.level_tier ??
              user.level ??
              'Bronze', // fallback default
          };
        }) ?? [];

      setUsers(combinedUsers);
    } catch (err) {
      console.error('Unexpected error in fetchUsers:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /** Returns Tailwind classes for the badge based on member level. */
  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'platinum':
        return 'text-purple-400 bg-purple-500/20';
      case 'gold':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'silver':
        return 'text-gray-300 bg-gray-500/20';
      case 'bronze':
        return 'text-orange-400 bg-orange-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  /** Human‑readable label for a level. */
  const getLevelName = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'platinum':
        return '白金會員';
      case 'gold':
        return '黃金會員';
      case 'silver':
        return '銀牌會員';
      case 'bronze':
        return '銅牌會員';
      default:
        return '一般會員';
    }
  };

  /** Apply search, level filter and sorting to the raw user list. */
  const filteredUsers = users
    .filter((user) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term);
      const matchesLevel =
        levelFilter === 'all' ||
        user.level?.toLowerCase() === levelFilter.toLowerCase();

      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'points':
          aValue = a.total_points ?? 0;
          bValue = b.total_points ?? 0;
          break;
        case 'level':
          const levelRank: Record<string, number> = {
            platinum: 4,
            gold: 3,
            silver: 2,
            bronze: 1,
          };
          aValue =
            levelRank[a.level?.toLowerCase() ?? ''] ?? 0;
          bValue =
            levelRank[b.level?.toLowerCase() ?? ''] ?? 0;
          break;
        case 'date':
          aValue = new Date(a.joined_at ?? a.created_at).getTime();
          bValue = new Date(b.joined_at ?? b.created_at).getTime();
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  /** Count of users that are marked as active. */
  const activeUsersCount = users.filter((u) => u.is_active !== false).length;

  /** Render loading placeholder while fetching data. */
  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
      {/* Header & stats */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">會員管理</h2>
          <p className="text-gray-400">
            總會員數：{users.length} | 活躍會員：{activeUsersCount}
          </p>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search input */}
        <div className="flex-1">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="搜尋會員姓名、信箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
            />
          </div>
        </div>

        {/* Level filter */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
        >
          <option value="all">所有等級</option>
          <option value="bronze">銅牌會員</option>
          <option value="silver">銀牌會員</option>
          <option value="gold">黃金會員</option>
          <option value="platinum">白金會員</option>
        </select>

        {/* Sort selector */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-');
            setSortBy(field as 'points' | 'level' | 'date');
            setSortOrder(order as 'asc' | 'desc');
          }}
          className="px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
        >
          <option value="points-desc">積分 (高到低)</option>
          <option value="points-asc">積分 (低到高)</option>
          <option value="level-desc">等級 (高到低)</option>
          <option value="level-asc">等級 (低到高)</option>
          <option value="date-desc">加入時間 (新到舊)</option>
          <option value="date-asc">加入時間 (舊到新)</option>
        </select>
      </div>

      {/* User table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-user-line text-6xl text-gray-600 mb-4"></i>
          <p className="text-gray-400 text-lg">
            {users.length === 0 ? '目前沒有會員數據' : '沒有符合條件的會員'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left py-4 px-4 text-gray-300 font-medium">
                  會員資訊
                </th>
                <th className="text-left py-4 px-4 text-gray-300 font-medium">
                  等級
                </th>
                <th className="text-left py-4 px-4 text-gray-300 font-medium">
                  積分
                </th>
                <th className="text-left py-4 px-4 text-gray-300 font-medium">
                  經驗值
                </th>
                <th className="text-left py-4 px-4 text-gray-300 font-medium">
                  加入時間
                </th>
                <th className="text-left py-4 px-4 text-gray-300 font-medium">
                  狀態
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  {/* User info */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-white">
                        {user.name || '未設定'}
                      </div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                    </div>
                  </td>

                  {/* Level badge */}
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(
                        user.level
                      )}`}
                    >
                      {getLevelName(user.level)}
                    </span>
                  </td>

                  {/* Points */}
                  <td className="py-4 px-4">
                    <span className="text-teal-400 font-medium">
                      {(user.total_points ?? 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Experience */}
                  <td className="py-4 px-4">
                    <span className="text-blue-400">
                      {(user.experience_points ?? 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Join date */}
                  <td className="py-4 px-4 text-gray-300">
                    {new Date(user.joined_at ?? user.created_at).toLocaleDateString(
                      'zh-TW'
                    )}
                  </td>

                  {/* Active / Inactive status */}
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.is_active !== false
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {user.is_active !== false ? '活躍' : '非活躍'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
