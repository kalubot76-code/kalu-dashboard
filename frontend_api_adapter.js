/**
 * ADAPTADOR API PT ↔ EN
 * 
 * Converte payloads do frontend (inglês) para backend (português) e vice-versa
 * Usar este adaptador no frontend para garantir compatibilidade
 */

// Mapeamento EN → PT (para enviar ao backend)
const EN_TO_PT = {
  // Task fields
  title: 'titulo',
  description: 'descricao',
  company: 'empresa',
  priority: 'prioridade',
  tags: 'tags',
  deadline: 'deadline',
  result: 'resultado',
  result_type: 'resultado_tipo',
  result_url: 'resultado_url',
  
  // Document fields
  doc_type: 'tipo',
  content: 'conteudo',
  project: 'projeto',
  version: 'versao',
  
  // Memory fields
  type: 'tipo',
  category: 'categoria',
  importance: 'importancia',
  context: 'contexto',
  
  // Activity fields
  icon: 'icon',
  actor: 'actor',
  
  // Calendar fields
  start_date: 'start_date',
  end_date: 'end_date',
  all_day: 'all_day',
  recurring: 'recorrente',
  recurrence: 'recorrencia',
  color: 'cor'
};

// Mapeamento PT → EN (para receber do backend)
const PT_TO_EN = Object.fromEntries(
  Object.entries(EN_TO_PT).map(([en, pt]) => [pt, en])
);

// Valores especiais (enums) EN → PT
const VALUE_MAPS = {
  // Priority
  High: 'Alta',
  Medium: 'Média',
  Low: 'Baixa',
  
  // Status  
  Pending: 'Pendente',
  'In Progress': 'Em Progresso',
  Completed: 'Concluído',
  Cancelled: 'Cancelado',
  
  // Importance
  low: 'baixa',
  normal: 'normal',
  high: 'alta',
  critical: 'crítica',
  
  // Memory type
  conversation: 'conversa',
  decision: 'decisão',
  lesson: 'lição',
  fact: 'facto'
};

// Inverso PT → EN
const VALUE_MAPS_REVERSE = Object.fromEntries(
  Object.entries(VALUE_MAPS).map(([en, pt]) => [pt, en])
);

/**
 * Converter objeto EN para PT (para enviar ao backend)
 */
function convertToPT(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(convertToPT);
  }
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const ptKey = EN_TO_PT[key] || key;
    
    // Converter valores especiais
    let ptValue = value;
    if (typeof value === 'string' && VALUE_MAPS[value]) {
      ptValue = VALUE_MAPS[value];
    } else if (typeof value === 'object') {
      ptValue = convertToPT(value);
    }
    
    converted[ptKey] = ptValue;
  }
  
  return converted;
}

/**
 * Converter objeto PT para EN (ao receber do backend)
 */
function convertToEN(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(convertToEN);
  }
  
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const enKey = PT_TO_EN[key] || key;
    
    // Converter valores especiais
    let enValue = value;
    if (typeof value === 'string' && VALUE_MAPS_REVERSE[value]) {
      enValue = VALUE_MAPS_REVERSE[value];
    } else if (typeof value === 'object') {
      enValue = convertToEN(value);
    }
    
    converted[enKey] = enValue;
  }
  
  return converted;
}

/**
 * Wrapper para axios/fetch que converte automaticamente
 */
class DashboardAPI {
  constructor(baseURL, getToken) {
    this.baseURL = baseURL;
    this.getToken = getToken; // Função que retorna o token JWT
  }
  
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Adicionar token se disponível
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method,
      headers
    };
    
    // Converter dados EN → PT antes de enviar
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(convertToPT(data));
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    
    // Converter resposta PT → EN
    const result = await response.json();
    return convertToEN(result);
  }
  
  // Atalhos
  get(endpoint) {
    return this.request('GET', endpoint);
  }
  
  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }
  
  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }
  
  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

// ====== EXEMPLO DE USO ======
/*
// 1. Criar instância da API
const api = new DashboardAPI(
  'https://kalu-dashboard-api.onrender.com',
  () => localStorage.getItem('token')  // Função que retorna o token
);

// 2. Login
const loginResponse = await fetch('https://kalu-dashboard-api.onrender.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'username=Oscar&password=Kalu2026'
});
const { access_token } = await loginResponse.json();
localStorage.setItem('token', access_token);

// 3. Criar tarefa (em INGLÊS no frontend)
const task = await api.post('/tasks/', {
  title: 'Finish Oshakati Report',
  description: 'Complete economic T3 report for Namibia',
  company: 'IMPULSO IA',
  priority: 'High',
  status: 'Pending'
});

console.log(task);  // Resposta convertida para INGLÊS

// 4. Listar tarefas
const tasks = await api.get('/tasks/');
console.log(tasks);  // Array com campos em INGLÊS

// 5. Criar documento
const doc = await api.post('/documents/', {
  title: 'T3 Oshakati Report',
  doc_type: 'HTML',
  project: 'Construction',
  version: 'final',
  file_path: '/path/to/file.html'
});

// 6. Criar memória
const memory = await api.post('/memories/', {
  type: 'lesson',
  title: 'Dashboard Debugging',
  content: 'Fixed PT/EN schema conflict',
  category: 'technical',
  importance: 'high'
});
*/

// Exportar para uso no frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DashboardAPI, convertToPT, convertToEN };
}

// Exportar para browser
if (typeof window !== 'undefined') {
  window.DashboardAPI = DashboardAPI;
  window.convertToPT = convertToPT;
  window.convertToEN = convertToEN;
}
