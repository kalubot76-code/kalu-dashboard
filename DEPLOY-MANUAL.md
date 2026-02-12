# 🚀 Guia de Deploy Manual

## Passo 1: Push para GitHub

### Opção A: Via GitHub Web (mais fácil)

1. Ir a https://github.com/kalubot76-code/kalu-dashboard
2. Settings → Danger Zone → Delete this repository (apagar o antigo)
3. Ir a https://github.com/new
4. Repository name: `kalu-dashboard`
5. Public
6. Create repository
7. No teu terminal:

```bash
cd /root/clawd/kalu-dashboard-new
git remote set-url origin https://github.com/kalubot76-code/kalu-dashboard.git
git push -u origin main
```

### Opção B: Via GitHub CLI (se instalado)

```bash
cd /root/clawd/kalu-dashboard-new
gh repo create kalubot76-code/kalu-dashboard --public --source=. --push
```

### Opção C: Copiar Ficheiros Manualmente

1. Fazer download desta pasta `/root/clawd/kalu-dashboard-new`
2. Ir a https://github.com/kalubot76-code/kalu-dashboard
3. Upload files → arrastar tudo
4. Commit changes

---

## Passo 2: Deploy Backend no Render

1. **Ir a:** https://dashboard.render.com
2. **Login com:** kalubot76@gmail.com
3. **New +** → **Web Service**
4. **Connect repository:** kalubot76-code/kalu-dashboard
5. **Configurar:**

   - **Name:** `kalu-dashboard-api`
   - **Region:** Frankfurt (ou mais próximo)
   - **Branch:** main
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

6. **Environment Variables:**
   - `SECRET_KEY` = `kalu-production-secret-key-2026-super-seguro`
   - `DATABASE_URL` = `sqlite:///./kalu.db`

7. **Create Web Service**

8. **Aguardar deploy** (~2-5 min)

9. **Copiar URL:** Ex: `https://kalu-dashboard-api.onrender.com`

---

## Passo 3: Deploy Frontend no Render

1. **New +** → **Static Site**
2. **Connect repository:** kalubot76-code/kalu-dashboard
3. **Configurar:**

   - **Name:** `kalu-dashboard`
   - **Branch:** main
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`

4. **Environment Variables:**
   - `REACT_APP_API_URL` = `https://kalu-dashboard-api.onrender.com`
     (usar a URL do backend do Passo 2)

5. **Create Static Site**

6. **Aguardar build** (~3-7 min)

7. **URL final:** Ex: `https://kalu-dashboard.onrender.com`

---

## Passo 4: Testar

1. **Abrir:** `https://kalu-dashboard.onrender.com`
2. **Login:**
   - Username: `Oscar`
   - Password: `Kalu2026`
3. **Criar tarefa de teste**
4. **Arrastar no Kanban**
5. **Verificar API:** `https://kalu-dashboard-api.onrender.com/tasks/pending`

---

## Passo 5: Integrar com Kalu (HEARTBEAT)

Editar `/root/clawd/HEARTBEAT.md`:

```markdown
# Heartbeat Tasks

## Verificar Dashboard Kalu

1. Fetch tarefas pendentes: `https://kalu-dashboard-api.onrender.com/tasks/pending`
2. Processar tarefas com prioridade Alta primeiro
3. Adicionar resultados via POST `/tasks/{id}/result`
4. Notificar Oscar se houver erros
```

---

## 🎉 Pronto!

Agora tens:
- ✅ Dashboard responsivo e funcional
- ✅ API REST completa
- ✅ Kanban drag-and-drop
- ✅ Integração com Kalu via API
- ✅ Deploy automático (cada push = novo deploy)

---

## 🔧 Troubleshooting

### Frontend não conecta ao backend

**Problema:** CORS ou URL errada

**Solução:**
1. Verificar `REACT_APP_API_URL` no Render frontend
2. Deve ser exactamente: `https://kalu-dashboard-api.onrender.com` (sem / no fim)
3. Rebuild frontend

### Backend não inicia

**Problema:** Dependências ou comando errado

**Solução:**
1. Verificar logs no Render
2. Confirmar `Start Command`: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Confirmar `Root Directory`: `backend`

### Banco de dados não persiste

**Problema:** SQLite em disco efémero (Render free tier)

**Solução:**
1. Upgrade para plano pago, ou
2. Migrar para PostgreSQL (Render oferece free tier):
   - New → PostgreSQL
   - Copiar `External Database URL`
   - Actualizar `DATABASE_URL` no backend

---

**Qualquer problema:** Telegram @OscarBento ou perguntar ao Kalu ⚡
