# 🚀 DEPLOY NO VERCEL - Passo a Passo

## 📋 PRÉ-REQUISITOS
- ✅ Conta GitHub (já tens)
- ✅ Repositório `kalu-dashboard` (já tens)
- ⚠️ Conta Vercel (criar agora)

---

## 🔧 PASSO 1: Criar Conta Vercel (2 minutos)

1. **Vai a:** https://vercel.com/signup
2. **Clica em:** "Continue with GitHub"
3. **Autoriza** Vercel a aceder ao GitHub
4. **Escolhe username** (pode ser `oscarbento` ou o que quiseres)
5. ✅ **Conta criada!**

---

## 📦 PASSO 2: Importar Projeto (3 minutos)

### Na dashboard do Vercel:

1. **Clica em:** "Add New..." → "Project"
2. **Procura:** `kalu-dashboard` na lista de repositórios
3. **Clica em:** "Import"

### Configuração do Projeto:

**Framework Preset:** 
- Escolhe: **Create React App**

**Root Directory:**
- Clica em "Edit"
- Escreve: `frontend`
- ✅ Confirma

**Build Settings:**
- Build Command: `npm run build` (já preenchido)
- Output Directory: `build` (já preenchido)
- Install Command: `npm install` (já preenchido)
- ✅ Deixa como está

**Environment Variables:**
- Clica em "Environment Variables"
- **Name:** `REACT_APP_API_URL`
- **Value:** `https://kalu-dashboard-api.onrender.com`
- ✅ Adiciona

4. **Clica em:** "Deploy" 🚀

---

## ⏱️ PASSO 3: Aguardar Deploy (2-3 minutos)

Vercel vai:
1. ✅ Clonar repositório
2. ✅ Instalar dependências
3. ✅ Build do React
4. ✅ Deploy automático

**Status visível em tempo real!**

Quando terminar, verás:
- ✅ **"Your project has been deployed"**
- 🔗 URL: `https://kalu-dashboard-XXXXX.vercel.app`

---

## 🧪 PASSO 4: Testar (1 minuto)

1. **Clica na URL** gerada
2. **Deve abrir:** Formulário de login bonito
3. **Login:**
   - Username: `Oscar`
   - Password: `Kalu2026`
4. ✅ **DEVE FUNCIONAR!**

Se funcionar:
- ✅ Dashboard com stats
- ✅ Criar tarefas
- ✅ Ver atividades
- ✅ Tudo operacional!

---

## 🎯 PASSO 5 (Opcional): Domínio Personalizado

Se quiseres URL bonito tipo `dashboard.oscarbento.com`:

1. **No Vercel, vai a:** Settings → Domains
2. **Adiciona:** `dashboard.oscarbento.com`
3. **Segue instruções** de DNS
4. ✅ Feito!

Mas a URL padrão `kalu-dashboard.vercel.app` já funciona perfeitamente.

---

## 🔄 DEPLOYS AUTOMÁTICOS

A partir de agora:
- ✅ **Cada git push** para `main` → deploy automático no Vercel
- ✅ **Sem fazer nada** manualmente
- ✅ **Preview** de cada pull request

---

## 🆘 TROUBLESHOOTING

### Problema: Build falha
**Solução:** 
- Verifica se escolheste `frontend` como Root Directory
- Verifica se framework é "Create React App"

### Problema: Página branca após deploy
**Solução:**
- Verifica se adicionaste a variável `REACT_APP_API_URL`
- Valor deve ser: `https://kalu-dashboard-api.onrender.com`

### Problema: Erros de CORS
**Solução:**
- Backend já tem CORS configurado
- Se persistir, avisa-me que ajusto

---

## 📞 SUPORTE

Se tiveres qualquer problema:
1. **Tira screenshot** do erro
2. **Envia-me**
3. **Resolvo** imediatamente

---

## ✅ CHECKLIST FINAL

- [ ] Conta Vercel criada
- [ ] Projeto importado
- [ ] Root Directory = `frontend`
- [ ] Framework = Create React App
- [ ] Environment Variable adicionada
- [ ] Deploy iniciado
- [ ] URL aberta
- [ ] Login testado
- [ ] 🎉 FUNCIONA!

---

**Preparado por:** Kalu  
**Para:** Oscar Bento  
**Data:** 14 Fevereiro 2026  

**Tempo total estimado:** 10-15 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)

🚀 **Vamos fazer brilhar!**
