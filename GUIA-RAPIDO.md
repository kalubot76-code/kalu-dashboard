# ⚡ GUIA RÁPIDO — Kalu Dashboard 2.0

## 🚀 TESTE LOCAL (5 minutos)

### **1. Backend**

```bash
cd /root/clawd/kalu-dashboard-new/backend

# Instalar dependências (se necessário)
pip install fastapi uvicorn sqlalchemy python-jose[cryptography] passlib[bcrypt] python-multipart

# Iniciar backend
python main.py
```

**Verifica:** http://localhost:8000  
Deve mostrar: `{"app": "Kalu Dashboard API", "version": "2.0.0", ...}`

---

### **2. Frontend**

```bash
cd /root/clawd/kalu-dashboard-new/frontend

# Instalar dependências
npm install

# Iniciar dev server
npm start
```

**Verifica:** http://localhost:3000  
Deve abrir o dashboard automaticamente.

**Login:**
- Username: `Oscar`
- Password: `Kalu2026`

---

## 📱 TESTAR FEATURES

### ✅ Activity Feed
1. Clica em ➕ Nova Tarefa
2. Cria uma tarefa qualquer
3. **Olha para o lado direito**
4. Deve aparecer no Activity Feed: "Tarefa criada: ..."

### ✅ Docs (Deliverables)
1. Clica em 📁 Docs no menu
2. Clica ➕ Novo Documento
3. Preenche:
   - Título: "Relatório Teste"
   - Tipo: JSON
   - Projeto: Delabento IA
   - Conteúdo: `{"teste": "ok"}`
4. Criar Documento
5. Deve aparecer na biblioteca

### ✅ Memory
1. Clica em 🧠 Memory no menu
2. Clica ➕ Nova Memória
3. Preenche:
   - Título: "Decisão Importante"
   - Tipo: Decisão
   - Importância: Alta
   - Conteúdo: "Decidimos usar React para o frontend"
4. Criar Memória
5. Deve aparecer na lista

### ✅ Projects
1. Clica em 📂 Projects no menu
2. Vês os 6 projetos com stats
3. Delabento IA deve ter a tarefa que criaste

### ✅ Kanban
1. Clica em 📋 Tasks no menu
2. Vês as colunas: Pendente, Em Progresso, Concluído, Bloqueado
3. Arrasta uma tarefa de Pendente para Em Progresso
4. **Olha Activity Feed** → deve registar a mudança

---

## 🌐 DEPLOY PRODUCTION

### **1. Preparar Código**

```bash
cd /root/clawd/kalu-dashboard-new

# Adicionar tudo ao git
git add .
git commit -m "Kalu Dashboard 2.0 - Upgrade completo"
git push origin main
```

### **2. Render Deploy**

**Backend:**
1. Vai a https://dashboard.render.com
2. Seleciona o serviço do backend
3. Verifica que `render.yaml` está correto
4. Deploy automático ao fazer push

**Frontend:**
1. Vai a https://dashboard.render.com
2. Seleciona o serviço do frontend
3. Verifica variável de ambiente:
   - `REACT_APP_API_URL` = URL do backend
4. Deploy automático

### **3. Verificar Online**

**Backend:**  
https://kalu-dashboard-api.onrender.com

**Frontend:**  
https://kalu-dashboard-4wcl.onrender.com

---

## 🔧 TROUBLESHOOTING

### Backend não arranca
```bash
# Verifica dependências
pip list | grep fastapi
pip list | grep sqlalchemy

# Se faltarem:
pip install -r requirements.txt
```

### Frontend não compila
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### CORS Error
Verifica em `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em dev: "*", em prod: domínio específico
    ...
)
```

### Database não cria
```bash
# Apagar e recriar
rm backend/kalu.db
python backend/main.py
```

---

## 📊 INTEGRAÇÃO COM HEARTBEAT

### **1. Editar HEARTBEAT.md**

```markdown
# HEARTBEAT.md

## 🔄 Verificação Automática de Tarefas

Executo o script de integração do Kalu Dashboard:

```python
import sys
sys.path.append('/root/clawd/kalu-dashboard-new')
from kalu_integration import heartbeat_check

heartbeat_check()
```

Se não houver tarefas pendentes: HEARTBEAT_OK
```

### **2. Testar Heartbeat**

```bash
cd /root/clawd/kalu-dashboard-new
python kalu_integration.py
```

Deve mostrar:
```
⚡ Kalu Dashboard Heartbeat
==================================================
✅ Sem tarefas pendentes
==================================================
```

---

## 🎯 COMANDOS ÚTEIS

### Backend
```bash
# Iniciar
python backend/main.py

# Logs
tail -f backend/logs.txt

# Reiniciar base de dados
rm backend/kalu.db && python backend/main.py
```

### Frontend
```bash
# Dev mode
npm start

# Build production
npm run build

# Servir build local
npx serve -s build
```

### Git
```bash
# Status
git status

# Commit
git add .
git commit -m "mensagem"

# Push
git push origin main

# Ver histórico
git log --oneline
```

---

## 📱 URLs IMPORTANTES

**Local:**
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

**Production:**
- Backend: https://kalu-dashboard-api.onrender.com
- Frontend: https://kalu-dashboard-4wcl.onrender.com
- API Docs: https://kalu-dashboard-api.onrender.com/docs

---

## ✅ CHECKLIST DE DEPLOY

- [ ] Testar backend local
- [ ] Testar frontend local
- [ ] Criar tarefa de teste
- [ ] Verificar Activity Feed
- [ ] Criar documento de teste
- [ ] Criar memória de teste
- [ ] Verificar todas as vistas
- [ ] Git commit + push
- [ ] Verificar deploy Render
- [ ] Testar online
- [ ] Configurar Heartbeat
- [ ] Celebrar! 🎉

---

**Qualquer problema, fala comigo! ⚡**
