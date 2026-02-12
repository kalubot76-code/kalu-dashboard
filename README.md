# ⚡ Kalu Dashboard v2.0

Dashboard moderno, responsivo e funcional para gestão de tarefas e empresas do Oscar Bento.

## 🎯 Características

✅ **Backend FastAPI**
- API REST completa
- Autenticação JWT
- SQLite (pronto para PostgreSQL)
- Endpoints para Kalu verificar/actualizar tarefas

✅ **Frontend React**
- 100% responsivo (mobile + desktop)
- Kanban drag-and-drop
- Interface limpa e rápida
- Modais para criar/ver tarefas

✅ **Integração Kalu**
- `/tasks/pending` → Kalu lê tarefas pendentes
- `/tasks/{id}/result` → Kalu escreve resultados
- Sistema de anexos (JSON, ficheiros, imagens)

---

## 📦 Estrutura

```
kalu-dashboard-new/
├── backend/               # FastAPI
│   ├── main.py           # Endpoints da API
│   ├── database.py       # Modelos SQLAlchemy
│   ├── schemas.py        # Schemas Pydantic
│   ├── auth.py           # Autenticação JWT
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/             # React
    ├── src/
    │   ├── App.js        # Componente principal
    │   ├── App.css       # Estilos responsivos
    │   └── index.js
    ├── public/
    │   └── index.html
    └── package.json
```

---

## 🚀 Deploy no Render

### Backend (Web Service)

1. **Criar Web Service:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `backend`
   - Environment: Python 3.11

2. **Variáveis de Ambiente:**
   ```
   SECRET_KEY=kalu-production-secret-2026
   DATABASE_URL=sqlite:///./kalu.db
   ```

3. **URL esperada:**
   ```
   https://kalu-dashboard-api.onrender.com
   ```

### Frontend (Static Site)

1. **Criar Static Site:**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
   - Root Directory: `frontend`

2. **Variáveis de Ambiente:**
   ```
   REACT_APP_API_URL=https://kalu-dashboard-api.onrender.com
   ```

3. **URL esperada:**
   ```
   https://kalu-dashboard.onrender.com
   ```

---

## 🤖 Integração com Kalu

### 1. Verificar Tarefas Pendentes

```python
import requests

response = requests.get("https://kalu-dashboard-api.onrender.com/tasks/pending")
tasks = response.json()

for task in tasks:
    print(f"Tarefa #{task['id']}: {task['titulo']} ({task['empresa']})")
```

### 2. Adicionar Resultado

```python
import requests

task_id = 1
result_data = {
    "resultado": '{"status": "completo", "ficheiros": ["output.json"]}',
    "resultado_tipo": "json",
    "resultado_url": "https://storage.example.com/output.json"
}

response = requests.post(
    f"https://kalu-dashboard-api.onrender.com/tasks/{task_id}/result",
    json=result_data
)

print(f"Resultado adicionado: {response.status_code}")
```

### 3. Configurar Heartbeat

**Adicionar a `HEARTBEAT.md`:**

```markdown
# Heartbeat Tasks

## Verificar Tarefas Kalu Dashboard

1. Fetch pending tasks via API
2. Process high-priority tasks first
3. Log any errors
4. Update task results when complete
```

**Integração automática no Kalu:**

```python
# Dentro do processo de heartbeat
async def check_kalu_dashboard():
    try:
        tasks = await get_pending_tasks()
        
        for task in tasks:
            if task['prioridade'] == 'Alta':
                # Executar tarefa
                result = await execute_task(task)
                
                # Adicionar resultado
                await post_task_result(task['id'], result)
    except Exception as e:
        log_error(f"Dashboard check failed: {e}")
```

---

## 🔑 Credenciais Padrão

**Username:** `Oscar`  
**Password:** `Kalu2026`

**API Token:** Gerado após login via `/token`

---

## 📊 Endpoints da API

### Autenticação
- `POST /token` - Login e obter JWT
- `GET /users/me` - Info do utilizador actual

### Tarefas
- `GET /tasks/` - Listar todas (filtros: status, empresa, prioridade)
- `GET /tasks/pending` - Tarefas pendentes para Kalu
- `POST /tasks/` - Criar tarefa
- `GET /tasks/{id}` - Ver tarefa
- `PUT /tasks/{id}` - Actualizar tarefa
- `POST /tasks/{id}/result` - Adicionar resultado (Kalu)
- `DELETE /tasks/{id}` - Eliminar tarefa

### Stats
- `GET /stats/overview` - Visão geral (totais, taxa conclusão)
- `GET /stats/by-empresa` - Tarefas por empresa

---

## 🎨 Funcionalidades do Frontend

1. **Kanban Interativo**
   - Arrastar tarefas entre colunas
   - 4 estados: Pendente, Em Progresso, Concluído, Bloqueado

2. **Gestão de Tarefas**
   - Criar tarefas com empresa, prioridade, descrição
   - Ver detalhes completos (incluindo resultados do Kalu)
   - Eliminar tarefas

3. **Stats em Tempo Real**
   - Total de tarefas
   - Taxa de conclusão
   - Distribuição por status

4. **100% Responsivo**
   - Mobile-first design
   - Funciona perfeitamente em telemóveis

---

## 🔧 Desenvolvimento Local

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API disponível em: `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm start
```

App disponível em: `http://localhost:3000`

---

## 📝 Próximos Passos

1. ✅ Deploy backend no Render
2. ✅ Deploy frontend no Render
3. ✅ Testar integração completa
4. ✅ Configurar heartbeat no Kalu
5. 🔄 Migrar para PostgreSQL (quando necessário)
6. 🔄 Adicionar upload de ficheiros
7. 🔄 Notificações push quando Kalu completa tarefas

---

**Desenvolvido por:** Kalu AI Assistant  
**Versão:** 2.0.0  
**Data:** 2026-02-12
