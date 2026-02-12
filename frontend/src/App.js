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

const COLUNAS = {
  'Pendente': { title: '📋 Pendente', color: '#94a3b8' },
  'Em Progresso': { title: '🔄 Em Progresso', color: '#3b82f6' },
  'Concluído': { title: '✅ Concluído', color: '#22c55e' },
  'Bloqueado': { title: '🚫 Bloqueado', color: '#ef4444' }
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    empresa: EMPRESAS[0],
    prioridade: 'Média',
    status: 'Pendente'
  });

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchTasks();
      fetchStats();
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
    } catch (err) {
      alert('Erro ao criar tarefa');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Eliminar esta tarefa?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
      fetchStats();
    } catch (err) {
      alert('Erro ao eliminar tarefa');
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

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-box">
          <h1>⚡ Kalu Dashboard</h1>
          <p>Gestão de Tarefas e Empresas</p>
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

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>⚡ Kalu Dashboard</h1>
          <div className="user-info">
            <span>Bem-vindo, {user?.full_name || user?.username}!</span>
            <button onClick={logout} className="btn-logout">Sair</button>
          </div>
        </div>
      </header>

      {/* Stats */}
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
          <div className="stat-card">
            <h3>{stats.taxa_conclusao}%</h3>
            <p>Taxa Conclusão</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="actions">
        <button onClick={() => setShowAddTask(true)} className="btn-primary">
          ➕ Nova Tarefa
        </button>
        <button onClick={fetchTasks} className="btn-secondary">
          🔄 Actualizar
        </button>
      </div>

      {/* Kanban Board */}
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

      {/* Modal: Add Task */}
      {showAddTask && (
        <div className="modal" onClick={() => setShowAddTask(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>➕ Nova Tarefa</h2>
            <form onSubmit={createTask}>
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
                <button type="button" onClick={() => setShowAddTask(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Criar Tarefa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Task Details */}
      {selectedTask && (
        <div className="modal" onClick={() => setSelectedTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedTask.titulo}</h2>
            
            <div className="task-detail-grid">
              <div><strong>Empresa:</strong> {selectedTask.empresa}</div>
              <div><strong>Prioridade:</strong> {selectedTask.prioridade}</div>
              <div><strong>Status:</strong> {selectedTask.status}</div>
              <div><strong>Criado por:</strong> {selectedTask.created_by}</div>
              <div><strong>Assignado a:</strong> {selectedTask.assigned_to}</div>
              <div><strong>Criado em:</strong> {new Date(selectedTask.created_at).toLocaleString('pt-PT')}</div>
            </div>
            
            {selectedTask.descricao && (
              <div className="task-detail-section">
                <strong>Descrição:</strong>
                <p>{selectedTask.descricao}</p>
              </div>
            )}
            
            {selectedTask.resultado && (
              <div className="task-detail-section result-section">
                <strong>✅ Resultado ({selectedTask.resultado_tipo}):</strong>
                <pre>{selectedTask.resultado}</pre>
                {selectedTask.resultado_url && (
                  <a href={selectedTask.resultado_url} target="_blank" rel="noopener noreferrer">
                    🔗 Ver ficheiro
                  </a>
                )}
              </div>
            )}
            
            <div className="modal-actions">
              <button onClick={() => deleteTask(selectedTask.id)} className="btn-danger">
                🗑️ Eliminar
              </button>
              <button onClick={() => setSelectedTask(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
