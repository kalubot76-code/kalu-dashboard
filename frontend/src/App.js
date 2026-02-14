import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const EMPRESAS = [
  "TRIPLE O & DB",
  "Delabento IA",
  "IMPULSO IA",
  "N'zamba Farma",
  "Só Mais Um",
  "Linha & Corpo"
];

const PROJETOS = [
  "Delabento IA",
  "IMPULSO IA",
  "N'zamba Farma",
  "Só Mais Um",
  "Linha & Corpo",
  "TRIPLE O & DB",
  "Outros"
];

const COLUNAS = {
  'Pendente': { title: '📋 Pendente', color: '#94a3b8' },
  'Em Progresso': { title: '🔄 Em Progresso', color: '#3b82f6' },
  'Concluído': { title: '✅ Concluído', color: '#22c55e' },
  'Bloqueado': { title: '🚫 Bloqueado', color: '#ef4444' }
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  
  // Data states
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [memories, setMemories] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [stats, setStats] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activityFeedOpen, setActivityFeedOpen] = useState(true);
  
  // Form states
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    empresa: EMPRESAS[0],
    prioridade: 'Média',
    status: 'Pendente'
  });

  const [docFormData, setDocFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'json',
    conteudo: '',
    empresa: EMPRESAS[0],
    projeto: PROJETOS[0],
    tags: ''
  });

  const [memoryFormData, setMemoryFormData] = useState({
    titulo: '',
    conteudo: '',
    tipo: 'conversation',
    categoria: 'business',
    importancia: 'normal',
    tags: ''
  });

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchTasks();
      fetchStats();
      fetchActivities();
      fetchDocuments();
      fetchMemories();
      
      // Polling para activity feed a cada 30s
      const interval = setInterval(() => {
        fetchActivities();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [token]);

  const api = axios.create({
    baseURL: API_URL,
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });

  const fetchUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
    } catch (err) {
      console.error(err);
      logout();
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats/overview');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await axios.get(`${API_URL}/activities/recent?limit=30`);
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents/');
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await api.get('/memories/');
      setMemories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('username', e.target.username.value);
    form.append('password', e.target.password.value);

    try {
      const res = await axios.post(`${API_URL}/token`, form);
      const newToken = res.data.access_token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
    } catch (err) {
      alert('Login falhou! Verifica username e password.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks/', formData);
      setFormData({
        titulo: '',
        descricao: '',
        empresa: EMPRESAS[0],
        prioridade: 'Média',
        status: 'Pendente'
      });
      setShowAddTask(false);
      fetchTasks();
      fetchStats();
      fetchActivities();
    } catch (err) {
      alert('Erro ao criar tarefa');
    }
  };

  const createDocument = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/documents/`, docFormData);
      setDocFormData({
        titulo: '',
        descricao: '',
        tipo: 'json',
        conteudo: '',
        empresa: EMPRESAS[0],
        projeto: PROJETOS[0],
        tags: ''
      });
      setShowAddDoc(false);
      fetchDocuments();
      fetchActivities();
    } catch (err) {
      alert('Erro ao criar documento');
    }
  };

  const createMemory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/memories/`, memoryFormData);
      setMemoryFormData({
        titulo: '',
        conteudo: '',
        tipo: 'conversation',
        categoria: 'business',
        importancia: 'normal',
        tags: ''
      });
      setShowAddMemory(false);
      fetchMemories();
      fetchActivities();
    } catch (err) {
      alert('Erro ao criar memória');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      fetchStats();
      fetchActivities();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Eliminar esta tarefa?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setSelectedTask(null);
      fetchTasks();
      fetchStats();
    } catch (err) {
      alert('Erro ao eliminar tarefa');
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm('Eliminar este documento?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setSelectedDoc(null);
      fetchDocuments();
    } catch (err) {
      alert('Erro ao eliminar documento');
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const taskId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;
    
    updateTaskStatus(taskId, newStatus);
  };

  const getPriorityColor = (prioridade) => {
    switch (prioridade) {
      case 'Alta': return '#ef4444';
      case 'Média': return '#f59e0b';
      case 'Baixa': return '#22c55e';
      default: return '#94a3b8';
    }
  };

  const getFileIcon = (tipo) => {
    const icons = {
      'json': '📋',
      'pdf': '📄',
      'docx': '📝',
      'xlsx': '📊',
      'html': '🌐',
      'image': '🖼️',
      'text': '📃'
    };
    return icons[tipo] || '📄';
  };

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>⚡ Kalu Dashboard 2.0</h1>
          <p>Gestão Completa de Tarefas, Documentos e Conhecimento</p>
          <form onSubmit={login}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              defaultValue="Oscar"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button type="submit">Entrar</button>
          </form>
          <small>Demo: Oscar / Kalu2026</small>
        </div>
      </div>
    );
  }

  const tasksByStatus = Object.keys(COLUNAS).reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {});

  const completedTasks = tasks.filter(t => t.status === 'Concluído');

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>⚡ Kalu Dashboard 2.0</h1>
            <span className="header-subtitle">by Triple O & DB</span>
          </div>
          <div className="user-info">
            <span>Bem-vindo, {user?.full_name || user?.username}!</span>
            <button onClick={logout} className="btn-logout">Sair</button>
          </div>
        </div>
      </header>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <span className="nav-section-title">PRINCIPAL</span>
              <button
                className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('dashboard')}
              >
                <span className="nav-icon">🏠</span>
                <span className="nav-label">Dashboard</span>
              </button>
              <button
                className={`nav-item ${currentView === 'kanban' ? 'active' : ''}`}
                onClick={() => setCurrentView('kanban')}
              >
                <span className="nav-icon">📋</span>
                <span className="nav-label">Tasks (Kanban)</span>
              </button>
              <button
                className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
                onClick={() => setCurrentView('calendar')}
              >
                <span className="nav-icon">📅</span>
                <span className="nav-label">Calendar</span>
              </button>
            </div>

            <div className="nav-section">
              <span className="nav-section-title">CONHECIMENTO</span>
              <button
                className={`nav-item ${currentView === 'docs' ? 'active' : ''}`}
                onClick={() => setCurrentView('docs')}
              >
                <span className="nav-icon">📁</span>
                <span className="nav-label">Docs</span>
                {documents.length > 0 && (
                  <span className="badge">{documents.length}</span>
                )}
              </button>
              <button
                className={`nav-item ${currentView === 'memory' ? 'active' : ''}`}
                onClick={() => setCurrentView('memory')}
              >
                <span className="nav-icon">🧠</span>
                <span className="nav-label">Memory</span>
                {memories.length > 0 && (
                  <span className="badge">{memories.length}</span>
                )}
              </button>
            </div>

            <div className="nav-section">
              <span className="nav-section-title">NEGÓCIO</span>
              <button
                className={`nav-item ${currentView === 'projects' ? 'active' : ''}`}
                onClick={() => setCurrentView('projects')}
              >
                <span className="nav-icon">📂</span>
                <span className="nav-label">Projects</span>
              </button>
              <button
                className={`nav-item ${currentView === 'empresas' ? 'active' : ''}`}
                onClick={() => setCurrentView('empresas')}
              >
                <span className="nav-icon">🏢</span>
                <span className="nav-label">Empresas</span>
              </button>
            </div>

            <div className="nav-section">
              <span className="nav-section-title">SISTEMA</span>
              <button
                className={`nav-item ${currentView === 'config' ? 'active' : ''}`}
                onClick={() => setCurrentView('config')}
              >
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">Configurações</span>
              </button>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-stats">
              <div className="sidebar-stat">
                <strong>{tasks.length}</strong>
                <span>Tarefas</span>
              </div>
              <div className="sidebar-stat">
                <strong>{documents.length}</strong>
                <span>Docs</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`content ${activityFeedOpen ? 'with-feed' : ''}`}>
          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <DashboardView 
              stats={stats}
              tasks={tasks}
              setShowAddTask={setShowAddTask}
              setSelectedTask={setSelectedTask}
              fetchTasks={fetchTasks}
              fetchStats={fetchStats}
            />
          )}

          {/* KANBAN VIEW */}
          {currentView === 'kanban' && (
            <KanbanView
              loading={loading}
              tasks={tasks}
              tasksByStatus={tasksByStatus}
              setShowAddTask={setShowAddTask}
              setSelectedTask={setSelectedTask}
              getPriorityColor={getPriorityColor}
              onDragEnd={onDragEnd}
              fetchTasks={fetchTasks}
              fetchStats={fetchStats}
            />
          )}

          {/* DOCS VIEW */}
          {currentView === 'docs' && (
            <DocsView
              documents={documents}
              setShowAddDoc={setShowAddDoc}
              setSelectedDoc={setSelectedDoc}
              getFileIcon={getFileIcon}
              fetchDocuments={fetchDocuments}
            />
          )}

          {/* MEMORY VIEW */}
          {currentView === 'memory' && (
            <MemoryView
              memories={memories}
              setShowAddMemory={setShowAddMemory}
              fetchMemories={fetchMemories}
            />
          )}

          {/* CALENDAR VIEW */}
          {currentView === 'calendar' && (
            <CalendarView
              calendarEvents={calendarEvents}
              tasks={tasks}
            />
          )}

          {/* PROJECTS VIEW */}
          {currentView === 'projects' && (
            <ProjectsView
              tasks={tasks}
              documents={documents}
              memories={memories}
            />
          )}

          {/* EMPRESAS VIEW */}
          {currentView === 'empresas' && (
            <EmpresasView tasks={tasks} />
          )}

          {/* CONFIG VIEW */}
          {currentView === 'config' && (
            <ConfigView user={user} />
          )}
        </main>

        {/* Activity Feed Sidebar */}
        {activityFeedOpen && (
          <aside className="activity-feed">
            <div className="activity-header">
              <h3>Live Activity</h3>
              <button onClick={() => setActivityFeedOpen(false)} className="close-btn">×</button>
            </div>
            <div className="activity-list">
              {activities.length === 0 ? (
                <div className="activity-empty">
                  <span>📭</span>
                  <p>Sem atividades recentes</p>
                </div>
              ) : (
                activities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <span className="activity-icon">{activity.icon}</span>
                    <div className="activity-content">
                      <strong>{activity.titulo}</strong>
                      {activity.descricao && <p>{activity.descricao}</p>}
                      <span className="activity-time">
                        {new Date(activity.created_at).toLocaleString('pt-PT', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Toggle Activity Feed Button (quando fechado) */}
        {!activityFeedOpen && (
          <button 
            className="toggle-activity-btn"
            onClick={() => setActivityFeedOpen(true)}
            title="Abrir Activity Feed"
          >
            📊
          </button>
        )}
      </div>

      {/* MODALS */}
      <TaskModal
        show={showAddTask}
        formData={formData}
        setFormData={setFormData}
        onSubmit={createTask}
        onClose={() => setShowAddTask(false)}
      />

      <DocModal
        show={showAddDoc}
        formData={docFormData}
        setFormData={setDocFormData}
        onSubmit={createDocument}
        onClose={() => setShowAddDoc(false)}
      />

      <MemoryModal
        show={showAddMemory}
        formData={memoryFormData}
        setFormData={setMemoryFormData}
        onSubmit={createMemory}
        onClose={() => setShowAddMemory(false)}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onDelete={deleteTask}
          getPriorityColor={getPriorityColor}
        />
      )}

      {selectedDoc && (
        <DocDetailModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onDelete={deleteDocument}
          getFileIcon={getFileIcon}
        />
      )}
    </div>
  );
}

// ============ COMPONENT VIEWS ============

function DashboardView({ stats, tasks, setShowAddTask, setSelectedTask, fetchTasks, fetchStats }) {
  return (
    <div className="view-container">
      <h2 className="view-title">🏠 Dashboard Geral</h2>
      
      {stats && (
        <div className="stats">
          <div className="stat-card">
            <h3>{stats.total_tasks}</h3>
            <p>Total Tarefas</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pendentes}</h3>
            <p>Pendentes</p>
          </div>
          <div className="stat-card">
            <h3>{stats.em_progresso}</h3>
            <p>Em Progresso</p>
          </div>
          <div className="stat-card">
            <h3>{stats.concluidas}</h3>
            <p>Concluídas</p>
          </div>
          <div className="stat-card highlight">
            <h3>{stats.taxa_conclusao}%</h3>
            <p>Taxa Conclusão</p>
          </div>
        </div>
      )}

      <div className="actions">
        <button onClick={() => setShowAddTask(true)} className="btn-primary">
          ➕ Nova Tarefa
        </button>
        <button onClick={() => { fetchTasks(); fetchStats(); }} className="btn-secondary">
          🔄 Actualizar
        </button>
      </div>

      <div className="recent-activity">
        <h3>📌 Tarefas Recentes</h3>
        {tasks.slice(0, 8).map(task => (
          <div key={task.id} className="activity-item" onClick={() => setSelectedTask(task)}>
            <div className="activity-icon">
              {task.status === 'Concluído' ? '✅' : task.status === 'Em Progresso' ? '🔄' : '📋'}
            </div>
            <div className="activity-content">
              <strong>{task.titulo}</strong>
              <span>{task.empresa} • {task.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanView({ loading, tasks, tasksByStatus, setShowAddTask, setSelectedTask, getPriorityColor, onDragEnd, fetchTasks, fetchStats }) {
  return (
    <div className="view-container">
      <h2 className="view-title">📋 Gestão de Tarefas (Kanban)</h2>
      
      <div className="actions">
        <button onClick={() => setShowAddTask(true)} className="btn-primary">
          ➕ Nova Tarefa
        </button>
        <button onClick={() => { fetchTasks(); fetchStats(); }} className="btn-secondary" disabled={loading}>
          🔄 {loading ? 'A actualizar...' : 'Actualizar'}
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {Object.entries(COLUNAS).map(([status, config]) => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`kanban-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                >
                  <div className="column-header" style={{ borderColor: config.color }}>
                    <h3>{config.title}</h3>
                    <span className="task-count">{tasksByStatus[status]?.length || 0}</span>
                  </div>
                  
                  <div className="tasks-list">
                    {tasksByStatus[status]?.map((task, index) => (
                      <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            onClick={() => setSelectedTask(task)}
                          >
                            <div className="task-header">
                              <h4>{task.titulo}</h4>
                              <span
                                className="priority-badge"
                                style={{ background: getPriorityColor(task.prioridade) }}
                              >
                                {task.prioridade}
                              </span>
                            </div>
                            
                            {task.descricao && (
                              <p className="task-description">{task.descricao}</p>
                            )}
                            
                            <div className="task-footer">
                              <span className="empresa-tag">{task.empresa}</span>
                              <span className="assigned-to">👤 {task.assigned_to}</span>
                            </div>
                            
                            {task.resultado && (
                              <div className="task-result">
                                ✅ Resultado disponível
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

function DocsView({ documents, setShowAddDoc, setSelectedDoc, getFileIcon, fetchDocuments }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || doc.tipo === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="view-container">
      <h2 className="view-title">📁 Biblioteca de Documentos</h2>
      <p className="view-subtitle">Todos os deliverables criados pelo Kalu</p>
      
      <div className="actions">
        <button onClick={() => setShowAddDoc(true)} className="btn-primary">
          ➕ Novo Documento
        </button>
        <button onClick={fetchDocuments} className="btn-secondary">
          🔄 Actualizar
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Procurar documentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="all">Todos os Tipos</option>
          <option value="json">JSON</option>
          <option value="pdf">PDF</option>
          <option value="docx">Word</option>
          <option value="xlsx">Excel</option>
          <option value="html">HTML</option>
        </select>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Sem documentos</h3>
          <p>Quando o Kalu criar deliverables, aparecerão aqui.</p>
        </div>
      ) : (
        <div className="docs-grid">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="doc-card" onClick={() => setSelectedDoc(doc)}>
              <div className="doc-icon-large">{getFileIcon(doc.tipo)}</div>
              <h3>{doc.titulo}</h3>
              <div className="doc-meta">
                <span className="doc-type">{doc.tipo.toUpperCase()}</span>
                <span className="doc-projeto">{doc.projeto || 'N/A'}</span>
              </div>
              {doc.descricao && (
                <p className="doc-description">{doc.descricao.substring(0, 100)}...</p>
              )}
              <div className="doc-footer">
                <span className="doc-date">
                  {new Date(doc.created_at).toLocaleDateString('pt-PT')}
                </span>
                {doc.versao && <span className="doc-version">{doc.versao}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MemoryView({ memories, setShowAddMemory, fetchMemories }) {
  const [filter, setFilter] = useState('all');

  const filteredMemories = memories.filter(mem => 
    filter === 'all' || mem.tipo === filter
  );

  return (
    <div className="view-container">
      <h2 className="view-title">🧠 Memória do Sistema</h2>
      <p className="view-subtitle">Contexto conversacional, decisões e lições aprendidas</p>
      
      <div className="actions">
        <button onClick={() => setShowAddMemory(true)} className="btn-primary">
          ➕ Nova Memória
        </button>
        <button onClick={fetchMemories} className="btn-secondary">
          🔄 Actualizar
        </button>
      </div>

      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="all">Todos os Tipos</option>
          <option value="conversation">Conversas</option>
          <option value="decision">Decisões</option>
          <option value="lesson">Lições</option>
          <option value="fact">Factos</option>
        </select>
      </div>

      {filteredMemories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧠</div>
          <h3>Sem memórias registadas</h3>
          <p>O histórico de contexto aparecerá aqui.</p>
        </div>
      ) : (
        <div className="memory-list">
          {filteredMemories.map(mem => (
            <div key={mem.id} className="memory-card">
              <div className="memory-header">
                <h3>{mem.titulo}</h3>
                <span className={`memory-badge ${mem.importancia}`}>
                  {mem.importancia}
                </span>
              </div>
              <p className="memory-content">{mem.conteudo.substring(0, 200)}...</p>
              <div className="memory-footer">
                <span className="memory-type">{mem.tipo}</span>
                <span className="memory-date">
                  {new Date(mem.created_at).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarView({ calendarEvents, tasks }) {
  return (
    <div className="view-container">
      <h2 className="view-title">📅 Calendário</h2>
      <p className="view-subtitle">Vista temporal de tarefas e eventos</p>
      
      <div className="calendar-placeholder">
        <div className="placeholder-icon">📅</div>
        <h3>Vista de Calendário</h3>
        <p>Implementação de calendário semanal/mensal em desenvolvimento.</p>
        <div className="upcoming-tasks">
          <h4>Próximas Tarefas:</h4>
          {tasks.filter(t => t.status !== 'Concluído').slice(0, 5).map(task => (
            <div key={task.id} className="upcoming-task">
              <span>{task.titulo}</span>
              <span className="task-empresa">{task.empresa}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectsView({ tasks, documents, memories }) {
  return (
    <div className="view-container">
      <h2 className="view-title">📂 Projetos</h2>
      <p className="view-subtitle">Vista organizada por projeto</p>
      
      <div className="projects-grid">
        {PROJETOS.map(projeto => {
          const projetoTasks = tasks.filter(t => t.empresa === projeto || t.empresa.includes(projeto));
          const projetoDocs = documents.filter(d => d.projeto === projeto);
          const projetoMems = memories.filter(m => m.empresa === projeto || (m.tags && m.tags.includes(projeto)));
          
          return (
            <div key={projeto} className="project-card">
              <h3>{projeto}</h3>
              <div className="project-stats">
                <div className="project-stat">
                  <span className="stat-value">{projetoTasks.length}</span>
                  <span className="stat-label">Tarefas</span>
                </div>
                <div className="project-stat">
                  <span className="stat-value">{projetoDocs.length}</span>
                  <span className="stat-label">Docs</span>
                </div>
                <div className="project-stat">
                  <span className="stat-value">{projetoMems.length}</span>
                  <span className="stat-label">Memórias</span>
                </div>
              </div>
              <div className="project-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${projetoTasks.length > 0 ? 
                        (projetoTasks.filter(t => t.status === 'Concluído').length / projetoTasks.length * 100) : 
                        0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmpresasView({ tasks }) {
  return (
    <div className="view-container">
      <h2 className="view-title">🏢 Empresas</h2>
      
      <div className="empresas-grid">
        {EMPRESAS.map(empresa => {
          const empresaTasks = tasks.filter(t => t.empresa === empresa);
          const concluidas = empresaTasks.filter(t => t.status === 'Concluído').length;
          const total = empresaTasks.length;
          
          return (
            <div key={empresa} className="empresa-card">
              <h3>{empresa}</h3>
              <div className="empresa-stats">
                <div className="empresa-stat">
                  <span className="stat-value">{total}</span>
                  <span className="stat-label">Tarefas</span>
                </div>
                <div className="empresa-stat">
                  <span className="stat-value">{concluidas}</span>
                  <span className="stat-label">Concluídas</span>
                </div>
                <div className="empresa-stat">
                  <span className="stat-value">
                    {total > 0 ? Math.round((concluidas / total) * 100) : 0}%
                  </span>
                  <span className="stat-label">Taxa</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConfigView({ user }) {
  return (
    <div className="view-container">
      <h2 className="view-title">⚙️ Configurações</h2>
      
      <div className="config-section">
        <h3>👤 Perfil</h3>
        <div className="config-item">
          <label>Nome:</label>
          <span>{user?.full_name || 'N/A'}</span>
        </div>
        <div className="config-item">
          <label>Username:</label>
          <span>{user?.username}</span>
        </div>
        <div className="config-item">
          <label>Email:</label>
          <span>{user?.email}</span>
        </div>
      </div>

      <div className="config-section">
        <h3>🔗 Endpoints da API</h3>
        <div className="config-item">
          <label>Backend URL:</label>
          <code>{API_URL}</code>
        </div>
        <div className="config-item">
          <label>Status:</label>
          <span className="status-badge online">🟢 Online</span>
        </div>
      </div>

      <div className="config-section">
        <h3>ℹ️ Informações do Sistema</h3>
        <div className="config-item">
          <label>Versão:</label>
          <span>2.0.0 - Edição Completa</span>
        </div>
        <div className="config-item">
          <label>Desenvolvido por:</label>
          <span>Kalu AI Assistant ⚡</span>
        </div>
        <div className="config-item">
          <label>Features:</label>
          <span>Tasks • Docs • Memory • Calendar • Projects</span>
        </div>
      </div>
    </div>
  );
}

// ============ MODALS ============

function TaskModal({ show, formData, setFormData, onSubmit, onClose }) {
  if (!show) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>➕ Nova Tarefa</h2>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Título *"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />
          
          <textarea
            placeholder="Descrição (opcional)"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            rows="4"
          />
          
          <select
            value={formData.empresa}
            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
          >
            {EMPRESAS.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
          
          <select
            value={formData.prioridade}
            onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
          >
            <option value="Alta">🔴 Alta</option>
            <option value="Média">🟡 Média</option>
            <option value="Baixa">🟢 Baixa</option>
          </select>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Criar Tarefa</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DocModal({ show, formData, setFormData, onSubmit, onClose }) {
  if (!show) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>➕ Novo Documento</h2>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Título *"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />
          
          <textarea
            placeholder="Descrição"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            rows="2"
          />
          
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          >
            <option value="json">JSON</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="xlsx">Excel</option>
            <option value="html">HTML</option>
            <option value="text">Text</option>
          </select>

          <select
            value={formData.projeto}
            onChange={(e) => setFormData({ ...formData, projeto: e.target.value })}
          >
            {PROJETOS.map(proj => (
              <option key={proj} value={proj}>{proj}</option>
            ))}
          </select>
          
          <textarea
            placeholder="Conteúdo do documento"
            value={formData.conteudo}
            onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
            rows="6"
          />
          
          <input
            type="text"
            placeholder="Tags (separadas por vírgula)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Criar Documento</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemoryModal({ show, formData, setFormData, onSubmit, onClose }) {
  if (!show) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>➕ Nova Memória</h2>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Título *"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />
          
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
          >
            <option value="conversation">Conversa</option>
            <option value="decision">Decisão</option>
            <option value="lesson">Lição</option>
            <option value="fact">Facto</option>
          </select>

          <select
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
          >
            <option value="business">Negócio</option>
            <option value="technical">Técnico</option>
            <option value="personal">Pessoal</option>
            <option value="project">Projeto</option>
          </select>

          <select
            value={formData.importancia}
            onChange={(e) => setFormData({ ...formData, importancia: e.target.value })}
          >
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
          
          <textarea
            placeholder="Conteúdo da memória *"
            value={formData.conteudo}
            onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
            rows="6"
            required
          />
          
          <input
            type="text"
            placeholder="Tags (separadas por vírgula)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Criar Memória</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskDetailModal({ task, onClose, onDelete, getPriorityColor }) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>{task.titulo}</h2>
        
        <div className="task-detail-grid">
          <div><strong>Empresa:</strong> {task.empresa}</div>
          <div><strong>Prioridade:</strong> 
            <span style={{ color: getPriorityColor(task.prioridade) }}> {task.prioridade}</span>
          </div>
          <div><strong>Status:</strong> {task.status}</div>
          <div><strong>Criado por:</strong> {task.created_by}</div>
          <div><strong>Assignado a:</strong> {task.assigned_to}</div>
          <div><strong>Criado em:</strong> {new Date(task.created_at).toLocaleString('pt-PT')}</div>
        </div>
        
        {task.descricao && (
          <div className="task-detail-section">
            <strong>📝 Descrição:</strong>
            <p>{task.descricao}</p>
          </div>
        )}
        
        {task.resultado && (
          <div className="task-detail-section result-section">
            <strong>✅ Resultado ({task.resultado_tipo}):</strong>
            <pre>{task.resultado}</pre>
            {task.completado_em && (
              <div className="result-timestamp">
                Concluído em: {new Date(task.completado_em).toLocaleString('pt-PT')}
              </div>
            )}
          </div>
        )}
        
        <div className="modal-actions">
          <button onClick={() => onDelete(task.id)} className="btn-danger">
            🗑️ Eliminar
          </button>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

function DocDetailModal({ doc, onClose, onDelete, getFileIcon }) {
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="doc-detail-header">
          <span className="doc-icon-large">{getFileIcon(doc.tipo)}</span>
          <div>
            <h2>{doc.titulo}</h2>
            <span className="doc-type-badge">{doc.tipo.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="task-detail-grid">
          <div><strong>Projeto:</strong> {doc.projeto || 'N/A'}</div>
          <div><strong>Empresa:</strong> {doc.empresa || 'N/A'}</div>
          <div><strong>Versão:</strong> {doc.versao}</div>
          <div><strong>Criado por:</strong> {doc.created_by}</div>
          <div><strong>Tamanho:</strong> {doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : 'N/A'}</div>
          <div><strong>Criado em:</strong> {new Date(doc.created_at).toLocaleString('pt-PT')}</div>
        </div>
        
        {doc.descricao && (
          <div className="task-detail-section">
            <strong>📝 Descrição:</strong>
            <p>{doc.descricao}</p>
          </div>
        )}

        {doc.tags && (
          <div className="task-detail-section">
            <strong>🏷️ Tags:</strong>
            <div className="tags">
              {doc.tags.split(',').map((tag, i) => (
                <span key={i} className="tag">{tag.trim()}</span>
              ))}
            </div>
          </div>
        )}
        
        {doc.conteudo && (
          <div className="task-detail-section">
            <strong>📄 Conteúdo:</strong>
            <pre className="doc-content-preview">{doc.conteudo.substring(0, 500)}...</pre>
          </div>
        )}
        
        <div className="modal-actions">
          <button onClick={() => onDelete(doc.id)} className="btn-danger">
            🗑️ Eliminar
          </button>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default App;
