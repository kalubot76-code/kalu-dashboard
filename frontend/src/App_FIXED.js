import React, { useState, useEffect, useMemo } from 'react';
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

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [memories, setMemories] = useState([]);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    empresa: EMPRESAS[0],
    prioridade: 'Média',
    status: 'Pendente'
  });
  
  const [docFormData, setDocFormData] = useState({
    titulo: '',
    tipo: 'JSON',
    projeto: '',
    descricao: ''
  });
  
  const [memoryFormData, setMemoryFormData] = useState({
    tipo: 'conversa',
    titulo: '',
    conteudo: '',
    importancia: 'normal'
  });
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  // ✅ FIX: Criar axios instance que atualiza quando token muda
  const api = useMemo(() => {
    return axios.create({
      baseURL: API_URL,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
  }, [token]);  // ← Recria quando token muda!

  // ✅ FIX: Salvar token no localStorage quando muda
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Fetch data quando token existe
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
  }, [token]);  // ← Refetch quando token muda

  const fetchUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
    } catch (err) {
      console.error('Erro ao buscar utilizador:', err);
      if (err.response?.status === 401) {
        // Token inválido, fazer logout
        logout();
      }
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats/overview');
      setStats(res.data);
    } catch (err) {
      console.error('Erro ao buscar stats:', err);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activities/recent');
      setActivities(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar activities:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents/');
      setDocuments(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await api.get('/memories/');
      setMemories(res.data || []);
    } catch (err) {
      console.error('Erro ao buscar memórias:', err);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const res = await axios.post(`${API_URL}/token`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      setToken(res.data.access_token);
      setCredentials({ username: '', password: '' });
    } catch (err) {
      alert('Login falhou. Verifica username/password.');
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
      alert('Erro ao criar tarefa: ' + (err.response?.data?.detail || err.message));
    }
  };

  const createDocument = async (e) => {
    e.preventDefault();
    try {
      await api.post('/documents/', docFormData);
      setDocFormData({
        titulo: '',
        tipo: 'JSON',
        projeto: '',
        descricao: ''
      });
      setShowAddDoc(false);
      fetchDocuments();
      fetchActivities();
    } catch (err) {
      alert('Erro ao criar documento: ' + (err.response?.data?.detail || err.message));
    }
  };

  const createMemory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/memories/', memoryFormData);
      setMemoryFormData({
        tipo: 'conversa',
        titulo: '',
        conteudo: '',
        importancia: 'normal'
      });
      setShowAddMemory(false);
      fetchMemories();
      fetchActivities();
    } catch (err) {
      alert('Erro ao criar memória: ' + (err.response?.data?.detail || err.message));
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Tens certeza?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
      fetchStats();
      fetchActivities();
    } catch (err) {
      alert('Erro ao eliminar tarefa');
    }
  };

  // Login Screen
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🔐 Kalu Dashboard</h1>
          <form onSubmit={login}>
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
            />
            <button type="submit">Entrar</button>
          </form>
          <p className="login-hint">
            <small>Default: Oscar / Kalu2026</small>
          </p>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>⚡ Kalu</h2>
          <p className="sidebar-subtitle">Dashboard 2.0</p>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">PRINCIPAL</div>
            <button 
              className={view === 'dashboard' ? 'active' : ''}
              onClick={() => setView('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={view === 'tasks' ? 'active' : ''}
              onClick={() => setView('tasks')}
            >
              📝 Tasks
            </button>
            <button 
              className={view === 'calendar' ? 'active' : ''}
              onClick={() => setView('calendar')}
            >
              📅 Calendário
            </button>
          </div>
          
          <div className="nav-section">
            <div className="nav-section-title">CONHECIMENTO</div>
            <button 
              className={view === 'documents' ? 'active' : ''}
              onClick={() => setView('documents')}
            >
              📚 Documentos
            </button>
            <button 
              className={view === 'memory' ? 'active' : ''}
              onClick={() => setView('memory')}
            >
              🧠 Memória
            </button>
          </div>
          
          <div className="nav-section">
            <div className="nav-section-title">NEGÓCIO</div>
            <button 
              className={view === 'projects' ? 'active' : ''}
              onClick={() => setView('projects')}
            >
              🎯 Projetos
            </button>
            <button 
              className={view === 'empresas' ? 'active' : ''}
              onClick={() => setView('empresas')}
            >
              🏢 Empresas
            </button>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <span>👤 {user?.username || 'Oscar'}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            🚪 Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="view-container">
            <h1>Dashboard Overview</h1>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.total_tasks || 0}</div>
                  <div className="stat-label">Total Tasks</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.pendentes || 0}</div>
                  <div className="stat-label">Pendentes</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.concluidas || 0}</div>
                  <div className="stat-label">Concluídas</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.taxa_conclusao ? stats.taxa_conclusao.toFixed(0) : 0}%</div>
                  <div className="stat-label">Taxa Conclusão</div>
                </div>
              </div>
            </div>
            
            <div className="recent-tasks">
              <h2>Tarefas Recentes</h2>
              {tasks.slice(0, 5).map(task => (
                <div key={task.id} className="task-item-mini">
                  <div>
                    <strong>{task.titulo}</strong>
                    <span className="task-meta"> • {task.empresa} • {task.prioridade}</span>
                  </div>
                  <span className={`status-badge status-${task.status.toLowerCase()}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks View */}
        {view === 'tasks' && (
          <div className="view-container">
            <div className="view-header">
              <h1>📝 Tarefas</h1>
              <button 
                className="btn-primary"
                onClick={() => setShowAddTask(true)}
              >
                + Nova Tarefa
              </button>
            </div>
            
            {showAddTask && (
              <div className="modal-overlay" onClick={() => setShowAddTask(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>Nova Tarefa</h2>
                  <form onSubmit={createTask}>
                    <input
                      type="text"
                      placeholder="Título"
                      value={formData.titulo}
                      onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                      required
                    />
                    <textarea
                      placeholder="Descrição"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    />
                    <select
                      value={formData.empresa}
                      onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                    >
                      {EMPRESAS.map(emp => (
                        <option key={emp} value={emp}>{emp}</option>
                      ))}
                    </select>
                    <select
                      value={formData.prioridade}
                      onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                    <div className="modal-actions">
                      <button type="button" onClick={() => setShowAddTask(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary">
                        Criar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-card-header">
                    <h3>{task.titulo}</h3>
                    <button 
                      className="btn-delete"
                      onClick={() => deleteTask(task.id)}
                    >
                      🗑️
                    </button>
                  </div>
                  <p>{task.descricao}</p>
                  <div className="task-card-footer">
                    <span className="task-badge">{task.empresa}</span>
                    <span className={`priority-badge priority-${task.prioridade.toLowerCase()}`}>
                      {task.prioridade}
                    </span>
                    <span className={`status-badge status-${task.status.toLowerCase()}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents View */}
        {view === 'documents' && (
          <div className="view-container">
            <div className="view-header">
              <h1>📚 Biblioteca de Documentos</h1>
              <button 
                className="btn-primary"
                onClick={() => setShowAddDoc(true)}
              >
                + Novo Documento
              </button>
            </div>
            
            {showAddDoc && (
              <div className="modal-overlay" onClick={() => setShowAddDoc(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>Novo Documento</h2>
                  <form onSubmit={createDocument}>
                    <input
                      type="text"
                      placeholder="Título"
                      value={docFormData.titulo}
                      onChange={(e) => setDocFormData({...docFormData, titulo: e.target.value})}
                      required
                    />
                    <select
                      value={docFormData.tipo}
                      onChange={(e) => setDocFormData({...docFormData, tipo: e.target.value})}
                    >
                      <option value="JSON">JSON</option>
                      <option value="PDF">PDF</option>
                      <option value="Word">Word</option>
                      <option value="Excel">Excel</option>
                      <option value="HTML">HTML</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Projeto"
                      value={docFormData.projeto}
                      onChange={(e) => setDocFormData({...docFormData, projeto: e.target.value})}
                    />
                    <textarea
                      placeholder="Descrição"
                      value={docFormData.descricao}
                      onChange={(e) => setDocFormData({...docFormData, descricao: e.target.value})}
                    />
                    <div className="modal-actions">
                      <button type="button" onClick={() => setShowAddDoc(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary">
                        Criar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            <div className="docs-grid">
              {documents.map(doc => (
                <div key={doc.id} className="doc-card">
                  <div className="doc-icon">
                    {doc.tipo === 'JSON' && '📄'}
                    {doc.tipo === 'PDF' && '📕'}
                    {doc.tipo === 'Word' && '📘'}
                    {doc.tipo === 'Excel' && '📗'}
                    {doc.tipo === 'HTML' && '🌐'}
                  </div>
                  <h3>{doc.titulo}</h3>
                  <p>{doc.descricao}</p>
                  <div className="doc-meta">
                    <span>{doc.tipo}</span>
                    <span>{doc.versao}</span>
                  </div>
                </div>
              ))}
              
              {documents.length === 0 && (
                <div className="empty-state">
                  <p>📚 Nenhum documento ainda. Cria o primeiro!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Memory View */}
        {view === 'memory' && (
          <div className="view-container">
            <div className="view-header">
              <h1>🧠 Sistema de Memória</h1>
              <button 
                className="btn-primary"
                onClick={() => setShowAddMemory(true)}
              >
                + Nova Memória
              </button>
            </div>
            
            {showAddMemory && (
              <div className="modal-overlay" onClick={() => setShowAddMemory(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>Nova Memória</h2>
                  <form onSubmit={createMemory}>
                    <select
                      value={memoryFormData.tipo}
                      onChange={(e) => setMemoryFormData({...memoryFormData, tipo: e.target.value})}
                    >
                      <option value="conversa">Conversa</option>
                      <option value="decisão">Decisão</option>
                      <option value="lição">Lição</option>
                      <option value="facto">Facto</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Título"
                      value={memoryFormData.titulo}
                      onChange={(e) => setMemoryFormData({...memoryFormData, titulo: e.target.value})}
                      required
                    />
                    <textarea
                      placeholder="Conteúdo"
                      value={memoryFormData.conteudo}
                      onChange={(e) => setMemoryFormData({...memoryFormData, conteudo: e.target.value})}
                      required
                    />
                    <select
                      value={memoryFormData.importancia}
                      onChange={(e) => setMemoryFormData({...memoryFormData, importancia: e.target.value})}
                    >
                      <option value="baixa">Baixa</option>
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                      <option value="crítica">Crítica</option>
                    </select>
                    <div className="modal-actions">
                      <button type="button" onClick={() => setShowAddMemory(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary">
                        Guardar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            <div className="memories-list">
              {memories.map(mem => (
                <div key={mem.id} className="memory-card">
                  <div className="memory-header">
                    <span className={`memory-type type-${mem.tipo}`}>
                      {mem.tipo === 'conversa' && '💬'}
                      {mem.tipo === 'decisão' && '✅'}
                      {mem.tipo === 'lição' && '📖'}
                      {mem.tipo === 'facto' && '📌'}
                      {' '}
                      {mem.tipo}
                    </span>
                    <span className={`importance-badge importance-${mem.importancia}`}>
                      {mem.importancia}
                    </span>
                  </div>
                  <h3>{mem.titulo}</h3>
                  <p>{mem.conteudo}</p>
                  <div className="memory-footer">
                    <small>{new Date(mem.created_at).toLocaleString('pt')}</small>
                  </div>
                </div>
              ))}
              
              {memories.length === 0 && (
                <div className="empty-state">
                  <p>🧠 Nenhuma memória guardada ainda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects View */}
        {view === 'projects' && (
          <div className="view-container">
            <h1>🎯 Projetos Ativos</h1>
            <div className="projects-grid">
              {EMPRESAS.map(empresa => {
                const empresaTasks = tasks.filter(t => t.empresa === empresa);
                const empresaDocs = documents.filter(d => d.empresa === empresa);
                
                return (
                  <div key={empresa} className="project-card">
                    <h3>🏢 {empresa}</h3>
                    <div className="project-stats">
                      <div className="project-stat">
                        <span className="stat-number">{empresaTasks.length}</span>
                        <span className="stat-label">Tarefas</span>
                      </div>
                      <div className="project-stat">
                        <span className="stat-number">{empresaDocs.length}</span>
                        <span className="stat-label">Docs</span>
                      </div>
                    </div>
                    <div className="project-progress">
                      <div 
                        className="progress-bar" 
                        style={{
                          width: `${empresaTasks.length > 0 
                            ? (empresaTasks.filter(t => t.status === 'Concluído').length / empresaTasks.length * 100) 
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Placeholder views */}
        {view === 'calendar' && (
          <div className="view-container">
            <h1>📅 Calendário</h1>
            <p className="empty-state">Calendário em desenvolvimento...</p>
          </div>
        )}

        {view === 'empresas' && (
          <div className="view-container">
            <h1>🏢 Empresas</h1>
            <p className="empty-state">Vista de empresas em desenvolvimento...</p>
          </div>
        )}
      </div>

      {/* Activity Feed (right sidebar) */}
      <div className="activity-feed">
        <h3>📊 Atividade Recente</h3>
        <div className="activities-list">
          {activities.map((activity, idx) => (
            <div key={idx} className="activity-item">
              <span className="activity-icon">{activity.icon || '📌'}</span>
              <div className="activity-content">
                <strong>{activity.titulo}</strong>
                {activity.descricao && <p>{activity.descricao}</p>}
                <small>{new Date(activity.created_at).toLocaleString('pt')}</small>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="empty-state">
              <p>Sem atividade recente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
