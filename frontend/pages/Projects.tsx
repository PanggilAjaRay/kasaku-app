import React, { useState } from 'react';
import { Briefcase, CheckCircle, Clock, Plus, MoreHorizontal, Calendar as CalendarIcon, Filter, X, Trash2, Pencil, CheckSquare, Square } from 'lucide-react';
import { Project, Task } from '../types';
import { useData } from '../App';

const Projects: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject, tasks, addTask, updateTask, deleteTask, clients } = useData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);
  
  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Form State
  const [projectForm, setProjectForm] = useState<Partial<Project>>({});
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '', dueDate: '' });

  // --- Project Handlers ---
  const handleOpenProjectModal = (proj?: Project) => {
    if (proj) {
      setProjectForm(proj);
    } else {
      setProjectForm({ name: '', clientId: '', budget: 0, dueDate: '', status: 'PLANNING', progress: 0 });
    }
    setShowProjectModal(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.clientId) return;

    const client = clients.find(c => c.id === projectForm.clientId);
    const clientName = client ? client.company : 'Unknown';

    if (projectForm.id) {
        // Update
        updateProject({ ...projectForm, clientName } as Project);
        if (selectedProject?.id === projectForm.id) {
            setSelectedProject({ ...projectForm, clientName } as Project);
        }
    } else {
        // Add
        const newProject: Project = {
            ...projectForm as Project,
            id: `P-${Date.now()}`,
            clientName: clientName,
            status: projectForm.status || 'PLANNING',
            progress: projectForm.progress || 0,
            budget: Number(projectForm.budget)
        };
        addProject(newProject);
        setSelectedProject(newProject);
    }
    setShowProjectModal(false);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Hapus proyek ini? Semua tugas terkait juga akan dihapus.')) {
        deleteProject(id);
        if (selectedProject?.id === id) {
            setSelectedProject(null);
        }
    }
  };

  // --- Task Handlers ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    const newTask: Task = {
      id: `T-${Date.now()}`,
      projectId: selectedProject.id,
      title: taskForm.title,
      assignee: taskForm.assignee,
      status: 'TODO',
      dueDate: taskForm.dueDate
    };
    addTask(newTask);
    setShowTaskModal(false);
    setTaskForm({ title: '', assignee: '', dueDate: '' });
  };

  const toggleTaskStatus = (task: Task) => {
      const newStatus = task.status === 'TODO' ? 'DONE' : 'TODO';
      updateTask({ ...task, status: newStatus });
  };

  const handleDeleteTask = (id: string) => {
      if (window.confirm('Hapus tugas ini?')) {
          deleteTask(id);
      }
  };

  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject.id) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'PLANNING': return 'bg-gray-100 text-gray-700';
      case 'ON_HOLD': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="text-blue-600" /> Proyek & Tugas
          </h1>
          <p className="text-gray-500 text-sm mt-1">Pantau kemajuan proyek dan delegasi tugas tim.</p>
        </div>
        <button onClick={() => handleOpenProjectModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
          <Plus size={18} /> Proyek Baru
        </button>
      </div>

      {/* PROJECT MODAL */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{projectForm.id ? 'Edit Proyek' : 'Buat Proyek Baru'}</h2>
                <button onClick={() => setShowProjectModal(false)}><X size={20} className="text-gray-400"/></button>
            </div>
            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Proyek</label>
                  <input required placeholder="Nama Proyek" className="w-full border p-2 rounded bg-white" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Klien</label>
                  <select required className="w-full border p-2 rounded bg-white" value={projectForm.clientId} onChange={e => setProjectForm({...projectForm, clientId: e.target.value})}>
                    <option value="">Pilih Klien</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company} ({c.name})</option>)}
                  </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Rp)</label>
                    <input required type="number" className="w-full border p-2 rounded bg-white" value={projectForm.budget} onChange={e => setProjectForm({...projectForm, budget: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tenggat Waktu</label>
                    <input required type="date" className="w-full border p-2 rounded bg-white" value={projectForm.dueDate} onChange={e => setProjectForm({...projectForm, dueDate: e.target.value})} />
                  </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select className="w-full border p-2 rounded bg-white" value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value as any})}>
                          <option value="PLANNING">Planning</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="ON_HOLD">On Hold</option>
                          <option value="COMPLETED">Completed</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                      <input type="number" min="0" max="100" className="w-full border p-2 rounded bg-white" value={projectForm.progress} onChange={e => setProjectForm({...projectForm, progress: Number(e.target.value)})} />
                  </div>
              </div>
              
              <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 mt-2">Simpan Proyek</button>
            </form>
          </div>
        </div>
      )}

      {/* TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Tambah Tugas Baru</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input required placeholder="Judul Tugas" className="w-full border p-2 rounded bg-white" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
              <input required placeholder="Ditugaskan ke (Nama)" className="w-full border p-2 rounded bg-white" value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})} />
              <input required type="date" className="w-full border p-2 rounded bg-white" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-gray-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
        {/* Project List */}
        <div className="w-full lg:w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Daftar Proyek</h2>
          </div>
          <div className="overflow-y-auto flex-1 p-3 space-y-3">
            {projects.length > 0 ? projects.map(project => (
              <div key={project.id} onClick={() => setSelectedProject(project)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedProject?.id === project.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${getStatusColor(project.status)}`}>{project.status.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-500">{project.dueDate}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{project.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{project.clientName}</p>
                <div className="flex items-center gap-2">
                   <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.progress}%` }}></div></div>
                   <span className="text-xs font-semibold text-gray-700">{project.progress}%</span>
                </div>
              </div>
            )) : <div className="p-4 text-center text-gray-400 text-sm">Belum ada proyek.</div>}
          </div>
        </div>

        {/* Project Details */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {selectedProject ? (
            <>
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                    <p className="text-gray-500 flex items-center gap-2 mt-1"><Briefcase size={14} /> {selectedProject.clientName} <span className="text-gray-300">|</span> Budget: Rp {selectedProject.budget.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenProjectModal(selectedProject)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit Proyek"><Pencil size={20} /></button>
                    <button onClick={() => handleDeleteProject(selectedProject.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Hapus Proyek"><Trash2 size={20} /></button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">Daftar Tugas ({projectTasks.length})</h3>
                  <button onClick={() => setShowTaskModal(true)} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"><Plus size={16} /> Tambah Tugas</button>
                </div>
                <div className="space-y-3">
                  {projectTasks.length > 0 ? projectTasks.map(task => (
                    <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm group">
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTaskStatus(task)} className={`transition-colors ${task.status === 'DONE' ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'}`}>
                            {task.status === 'DONE' ? <CheckCircle size={24} /> : <Square size={24} />}
                        </button>
                        <div>
                          <p className={`font-medium ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500"><span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">@{task.assignee}</span><span className="flex items-center gap-1"><CalendarIcon size={10} /> {task.dueDate}</span></div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                    </div>
                  )) : <div className="text-center py-10 text-gray-400">Belum ada tugas.</div>}
                </div>
              </div>
            </>
          ) : <div className="flex-1 flex items-center justify-center text-gray-400">Pilih proyek untuk melihat detail.</div>}
        </div>
      </div>
    </div>
  );
};

export default Projects;