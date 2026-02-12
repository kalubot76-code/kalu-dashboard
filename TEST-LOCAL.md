# 🧪 Testar Localmente (Antes do Deploy)

## Requisitos

- Python 3.10+
- Node.js 16+
- npm ou yarn

---

## Backend (Terminal 1)

```bash
cd /root/clawd/kalu-dashboard-new/backend

# Criar ambiente virtual (opcional mas recomendado)
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Iniciar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**API disponível em:** http://localhost:8000

**Testar:**
- http://localhost:8000/ → Deve mostrar status da API
- http://localhost:8000/docs → Documentação Swagger interativa

---

## Frontend (Terminal 2)

```bash
cd /root/clawd/kalu-dashboard-new/frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

**App disponível em:** http://localhost:3000

**Vai abrir automaticamente no browser**

---

## Teste Completo

### 1. Login
- Username: `Oscar`
- Password: `Kalu2026`

### 2. Criar Tarefa
- Clicar "➕ Nova Tarefa"
- Título: "Teste Dashboard"
- Empresa: "Delabento IA"
- Prioridade: "Alta"
- Criar

### 3. Testar Kanban
- Arrastar tarefa de "Pendente" para "Em Progresso"
- Deve actualizar automaticamente

### 4. Ver Detalhes
- Clicar na tarefa
- Deve abrir modal com informações completas

### 5. Testar API Directamente

```bash
# Obter token
curl -X POST http://localhost:8000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=Oscar&password=Kalu2026"

# Copiar o access_token da resposta

# Listar tarefas
curl http://localhost:8000/tasks/ \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Tarefas pendentes (sem auth - para Kalu)
curl http://localhost:8000/tasks/pending

# Adicionar resultado (sem auth - para Kalu)
curl -X POST http://localhost:8000/tasks/1/result \
  -H "Content-Type: application/json" \
  -d '{
    "resultado": "{\"status\": \"completo\"}",
    "resultado_tipo": "json"
  }'
```

---

## 📱 Testar Responsividade

### Desktop
- Abrir http://localhost:3000
- Deve mostrar 4 colunas Kanban lado a lado

### Tablet
- Abrir DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Seleccionar iPad/Tablet
- Deve ajustar para 2 colunas

### Mobile
- Seleccionar iPhone/Android
- Deve mostrar 1 coluna de cada vez
- Scroll vertical

---

## ✅ Checklist de Teste

- [ ] Backend inicia sem erros
- [ ] Frontend inicia e conecta ao backend
- [ ] Login funciona
- [ ] Criar tarefa funciona
- [ ] Kanban drag-and-drop funciona
- [ ] Stats actualizam em tempo real
- [ ] Modal de detalhes abre
- [ ] API `/tasks/pending` retorna dados
- [ ] Responsivo funciona (testar mobile)
- [ ] Eliminar tarefa funciona

---

## 🐛 Problemas Comuns

### "Module not found" no frontend
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### "Address already in use" no backend
```bash
# Matar processo na porta 8000
lsof -ti:8000 | xargs kill -9
# ou usar porta diferente:
uvicorn main:app --reload --port 8001
```

### Frontend não conecta ao backend
- Verificar se backend está a correr em http://localhost:8000
- Verificar console do browser (F12) para erros CORS

### Banco de dados vazio
- Primeiro login cria utilizador "Oscar" automaticamente
- Se não funcionar, apagar `kalu.db` e reiniciar backend

---

**Tudo OK?** Prosseguir para DEPLOY-MANUAL.md ⚡
