
interface ProjectSelectorProps {
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
}

export default function ProjectSelector({ selectedProject, onProjectChange }: ProjectSelectorProps) {
  const projects = [
    { id: 'project-1', name: '咖啡連鎖店忠誠計劃', users: 2580, status: 'active' },
    { id: 'project-2', name: '服飾品牌會員系統', users: 1420, status: 'active' },
    { id: 'project-3', name: '餐廳集點活動', users: 890, status: 'active' },
    { id: 'project-4', name: '健身房會員計劃', users: 650, status: 'inactive' }
  ];

  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">專案管理</h2>
          <p className="text-sm text-gray-500 mt-1">選擇要管理的專案</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedProject}
            onChange={(e) => onProjectChange(e.target.value)}
            className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-8"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 cursor-pointer whitespace-nowrap">
            新增專案
          </button>
        </div>
      </div>
      
      {currentProject && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{currentProject.name}</h3>
              <p className="text-sm text-gray-500">活躍用戶: {currentProject.users.toLocaleString()}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              currentProject.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {currentProject.status === 'active' ? '運行中' : '已暫停'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
