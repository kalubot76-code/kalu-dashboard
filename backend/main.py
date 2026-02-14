from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta, datetime
import json
import os

import database
import schemas
import auth

# Initialize database
database.init_db()

# Create FastAPI app
app = FastAPI(
    title="Kalu Dashboard API",
    description="API para gestão de tarefas e empresas do Oscar Bento",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção: especificar domínios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar utilizador padrão ao iniciar
@app.on_event("startup")
def create_default_user():
    db = database.SessionLocal()
    try:
        # Apagar TODOS os utilizadores para garantir recriação limpa
        db.query(database.User).delete()
        db.commit()
        print("🔄 Base de dados de utilizadores limpa")
        
        # Criar utilizador com password correcta
        user = database.User(
            username="Oscar",
            email="oscar@tripleo.ao",
            full_name="Oscar Bento",
            hashed_password=auth.get_password_hash("Kalu2026"),
            is_active=True
        )
        db.add(user)
        db.commit()
        print("✅ Utilizador padrão criado: Oscar / Kalu2026")
    except Exception as e:
        print(f"❌ Erro ao criar utilizador: {e}")
        print("🔄 A tentar recriar base de dados...")
        # Se falhar, recriar tabelas completamente
        try:
            database.Base.metadata.drop_all(bind=database.engine)
            database.Base.metadata.create_all(bind=database.engine)
            db = database.SessionLocal()
            user = database.User(
                username="Oscar",
                email="oscar@tripleo.ao",
                full_name="Oscar Bento",
                hashed_password=auth.get_password_hash("Kalu2026"),
                is_active=True
            )
            db.add(user)
            db.commit()
            print("✅ Base de dados recriada e utilizador criado")
        except Exception as e2:
            print(f"❌❌ ERRO CRÍTICO: {e2}")
            raise
    finally:
        db.close()

# ==================== AUTH ENDPOINTS ====================

@app.post("/token", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username ou password incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: database.User = Depends(auth.get_current_active_user)):
    return current_user

# ==================== TASK ENDPOINTS ====================

@app.post("/tasks/", response_model=schemas.Task, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    db_task = database.Task(
        **task.dict(),
        created_by=current_user.username
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks/", response_model=List[schemas.Task])
async def list_tasks(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    empresa: str = None,
    prioridade: str = None,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    query = db.query(database.Task)
    
    if status:
        query = query.filter(database.Task.status == status)
    if empresa:
        query = query.filter(database.Task.empresa == empresa)
    if prioridade:
        query = query.filter(database.Task.prioridade == prioridade)
    
    tasks = query.order_by(database.Task.created_at.desc()).offset(skip).limit(limit).all()
    return tasks

@app.get("/tasks/pending", response_model=List[schemas.Task])
async def get_pending_tasks(
    db: Session = Depends(database.get_db)
):
    """Endpoint especial para o Kalu verificar tarefas pendentes (sem autenticação)"""
    tasks = db.query(database.Task).filter(
        database.Task.status.in_(["Pendente", "Em Progresso"]),
        database.Task.assigned_to == "Kalu"
    ).order_by(database.Task.prioridade.desc(), database.Task.created_at.asc()).all()
    return tasks

@app.get("/tasks/{task_id}", response_model=schemas.Task)
async def get_task(
    task_id: int,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    task = db.query(database.Task).filter(database.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    return task

@app.put("/tasks/{task_id}", response_model=schemas.Task)
async def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    task = db.query(database.Task).filter(database.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task

@app.post("/tasks/{task_id}/result", response_model=schemas.Task)
async def add_task_result(
    task_id: int,
    result: schemas.TaskResult,
    db: Session = Depends(database.get_db)
):
    """Endpoint para o Kalu adicionar resultados de tarefas (sem autenticação)"""
    task = db.query(database.Task).filter(database.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    task.resultado = result.resultado
    task.resultado_tipo = result.resultado_tipo
    task.resultado_url = result.resultado_url
    task.status = "Concluído"
    task.completado_em = datetime.utcnow()
    task.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    return task

@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    task = db.query(database.Task).filter(database.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    db.delete(task)
    db.commit()
    return None

# ==================== STATS ENDPOINTS ====================

@app.get("/stats/overview")
async def get_overview_stats(
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    total_tasks = db.query(database.Task).count()
    pendentes = db.query(database.Task).filter(database.Task.status == "Pendente").count()
    em_progresso = db.query(database.Task).filter(database.Task.status == "Em Progresso").count()
    concluidas = db.query(database.Task).filter(database.Task.status == "Concluído").count()
    
    return {
        "total_tasks": total_tasks,
        "pendentes": pendentes,
        "em_progresso": em_progresso,
        "concluidas": concluidas,
        "taxa_conclusao": round((concluidas / total_tasks * 100) if total_tasks > 0 else 0, 1)
    }

@app.get("/stats/by-empresa")
async def get_stats_by_empresa(
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    from sqlalchemy import func
    
    results = db.query(
        database.Task.empresa,
        func.count(database.Task.id).label('total')
    ).group_by(database.Task.empresa).all()
    
    return [{"empresa": r.empresa, "total": r.total} for r in results]

# ==================== DOCUMENT DOWNLOAD ====================

@app.get("/tasks/{task_id}/download/{format}")
async def download_task_document(
    task_id: int,
    format: str,  # pdf, docx, xlsx
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    """
    Gera e faz download de documento em formato específico
    """
    # Buscar tarefa
    task = db.query(database.Task).filter(database.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    if not task.resultado:
        raise HTTPException(status_code=400, detail="Tarefa não tem resultado")
    
    # Preparar dados
    try:
        # Tentar parsear como JSON
        if task.resultado.strip().startswith('{'):
            data = json.loads(task.resultado)
        else:
            # HTML ou texto
            data = {"content": task.resultado}
    except:
        data = {"content": task.resultado}
    
    task_title = task.titulo
    
    # Gerar documento conforme formato
    try:
        if format == "docx":
            # Gerar Word
            from kalu_document_generator_advanced import generate_word_document
            output_path = f"/tmp/task_{task_id}.docx"
            generate_word_document(data, task_title, output_path)
            
            return FileResponse(
                path=output_path,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                filename=f"{task_title[:50].replace(' ', '_')}.docx",
                headers={"Content-Disposition": f"attachment; filename={task_title[:50].replace(' ', '_')}.docx"}
            )
        
        elif format == "xlsx":
            # Gerar Excel
            from kalu_document_generator_advanced import generate_excel_document
            output_path = f"/tmp/task_{task_id}.xlsx"
            generate_excel_document(data, task_title, output_path)
            
            return FileResponse(
                path=output_path,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename=f"{task_title[:50].replace(' ', '_')}.xlsx",
                headers={"Content-Disposition": f"attachment; filename={task_title[:50].replace(' ', '_')}.xlsx"}
            )
        
        elif format == "pdf":
            # Gerar PDF
            from kalu_document_generator_advanced import generate_pdf_from_html
            from kalu_document_generator import generate_html_report, generate_markdown_report
            
            # Se já for HTML, usar direto
            if task.resultado_tipo == "html" and task.resultado.strip().startswith('<'):
                html_content = task.resultado
            else:
                # Gerar HTML do JSON/texto
                markdown = generate_markdown_report(data, task_title)
                html_content = generate_html_report(markdown)
            
            output_path = f"/tmp/task_{task_id}.pdf"
            generate_pdf_from_html(html_content, output_path)
            
            return FileResponse(
                path=output_path,
                media_type="application/pdf",
                filename=f"{task_title[:50].replace(' ', '_')}.pdf",
                headers={"Content-Disposition": f"attachment; filename={task_title[:50].replace(' ', '_')}.pdf"}
            )
        
        else:
            raise HTTPException(status_code=400, detail=f"Formato não suportado: {format}")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar documento: {str(e)}")

# ==================== ACTIVITY FEED ENDPOINTS ====================

@app.post("/activities/", status_code=status.HTTP_201_CREATED)
async def create_activity(
    tipo: str,
    titulo: str,
    descricao: str = None,
    actor: str = "Kalu",
    target_id: int = None,
    target_type: str = None,
    extra_data: str = None,
    icon: str = "📌",
    db: Session = Depends(database.get_db)
):
    """Criar nova entrada no Activity Feed"""
    activity = database.Activity(
        tipo=tipo,
        titulo=titulo,
        descricao=descricao,
        actor=actor,
        target_id=target_id,
        target_type=target_type,
        extra_data=extra_data,
        icon=icon
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity

@app.get("/activities/")
async def list_activities(
    skip: int = 0,
    limit: int = 50,
    tipo: str = None,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    """Listar actividades (com filtros opcionais)"""
    query = db.query(database.Activity)
    
    if tipo:
        query = query.filter(database.Activity.tipo == tipo)
    
    activities = query.order_by(database.Activity.created_at.desc()).offset(skip).limit(limit).all()
    return activities

@app.get("/activities/recent")
async def get_recent_activities(
    limit: int = 20,
    db: Session = Depends(database.get_db)
):
    """Actividades recentes (sem autenticação - para widgets)"""
    activities = db.query(database.Activity).order_by(
        database.Activity.created_at.desc()
    ).limit(limit).all()
    return activities

# ==================== DOCUMENTS ENDPOINTS ====================

@app.post("/documents/", status_code=status.HTTP_201_CREATED)
async def create_document(
    titulo: str,
    tipo: str,
    conteudo: str = None,
    descricao: str = None,
    empresa: str = None,
    projeto: str = None,
    task_id: int = None,
    tags: str = None,
    versao: str = "v1",
    created_by: str = "Kalu",
    db: Session = Depends(database.get_db)
):
    """Criar novo documento/deliverable"""
    document = database.Document(
        titulo=titulo,
        tipo=tipo,
        conteudo=conteudo,
        descricao=descricao,
        empresa=empresa,
        projeto=projeto,
        task_id=task_id,
        tags=tags,
        versao=versao,
        created_by=created_by,
        file_size=len(conteudo) if conteudo else 0
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Registar no Activity Feed
    activity = database.Activity(
        tipo="document_created",
        titulo=f"Documento criado: {titulo}",
        descricao=f"Tipo: {tipo} | Projeto: {projeto or 'N/A'}",
        actor=created_by,
        target_id=document.id,
        target_type="document",
        icon="📄"
    )
    db.add(activity)
    db.commit()
    
    return document

@app.get("/documents/")
async def list_documents(
    skip: int = 0,
    limit: int = 100,
    tipo: str = None,
    empresa: str = None,
    projeto: str = None,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    """Listar documentos com filtros"""
    query = db.query(database.Document)
    
    if tipo:
        query = query.filter(database.Document.tipo == tipo)
    if empresa:
        query = query.filter(database.Document.empresa == empresa)
    if projeto:
        query = query.filter(database.Document.projeto == projeto)
    
    documents = query.order_by(database.Document.created_at.desc()).offset(skip).limit(limit).all()
    return documents

@app.get("/documents/{doc_id}")
async def get_document(
    doc_id: int,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    """Obter documento específico"""
    doc = db.query(database.Document).filter(database.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    return doc

@app.delete("/documents/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: int,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    """Eliminar documento"""
    doc = db.query(database.Document).filter(database.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    db.delete(doc)
    db.commit()
    return None

# ==================== MEMORY ENDPOINTS ====================

@app.post("/memories/", status_code=status.HTTP_201_CREATED)
async def create_memory(
    tipo: str,
    titulo: str,
    conteudo: str,
    categoria: str = None,
    importancia: str = "normal",
    empresa: str = None,
    tags: str = None,
    db: Session = Depends(database.get_db)
):
    """Criar nova memória/contexto"""
    memory = database.Memory(
        tipo=tipo,
        titulo=titulo,
        conteudo=conteudo,
        categoria=categoria,
        importancia=importancia,
        empresa=empresa,
        tags=tags
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)
    
    # Registar no Activity Feed
    activity = database.Activity(
        tipo="memory_created",
        titulo=f"Memória registada: {titulo}",
        descricao=f"Tipo: {tipo} | Importância: {importancia}",
        actor="Kalu",
        target_id=memory.id,
        target_type="memory",
        icon="🧠"
    )
    db.add(activity)
    db.commit()
    
    return memory

@app.get("/memories/")
async def list_memories(
    skip: int = 0,
    limit: int = 100,
    tipo: str = None,
    categoria: str = None,
    importancia: str = None,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    """Listar memórias com filtros"""
    query = db.query(database.Memory)
    
    if tipo:
        query = query.filter(database.Memory.tipo == tipo)
    if categoria:
        query = query.filter(database.Memory.categoria == categoria)
    if importancia:
        query = query.filter(database.Memory.importancia == importancia)
    
    memories = query.order_by(database.Memory.created_at.desc()).offset(skip).limit(limit).all()
    return memories

@app.get("/memories/search")
async def search_memories(
    q: str,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    """Buscar memórias por texto"""
    from sqlalchemy import or_
    
    memories = db.query(database.Memory).filter(
        or_(
            database.Memory.titulo.contains(q),
            database.Memory.conteudo.contains(q),
            database.Memory.tags.contains(q)
        )
    ).order_by(database.Memory.importancia.desc(), database.Memory.created_at.desc()).all()
    
    return memories

# ==================== CALENDAR ENDPOINTS ====================

@app.post("/calendar/", status_code=status.HTTP_201_CREATED)
async def create_calendar_event(
    titulo: str,
    start_date: datetime,
    tipo: str = "task",
    descricao: str = None,
    end_date: datetime = None,
    all_day: bool = False,
    empresa: str = None,
    task_id: int = None,
    recorrente: bool = False,
    recorrencia: str = None,
    cor: str = "#3b82f6",
    db: Session = Depends(database.get_db)
):
    """Criar evento no calendário"""
    event = database.CalendarEvent(
        titulo=titulo,
        start_date=start_date,
        tipo=tipo,
        descricao=descricao,
        end_date=end_date,
        all_day=all_day,
        empresa=empresa,
        task_id=task_id,
        recorrente=recorrente,
        recorrencia=recorrencia,
        cor=cor
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@app.get("/calendar/")
async def list_calendar_events(
    start: datetime = None,
    end: datetime = None,
    tipo: str = None,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    """Listar eventos do calendário (com range de datas)"""
    query = db.query(database.CalendarEvent)
    
    if start:
        query = query.filter(database.CalendarEvent.start_date >= start)
    if end:
        query = query.filter(database.CalendarEvent.start_date <= end)
    if tipo:
        query = query.filter(database.CalendarEvent.tipo == tipo)
    
    events = query.order_by(database.CalendarEvent.start_date.asc()).all()
    return events

@app.delete("/calendar/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_calendar_event(
    event_id: int,
    db: Session = Depends(database.get_db),
    current_user: database.User = Depends(auth.get_current_active_user)
):
    """Eliminar evento do calendário"""
    event = db.query(database.CalendarEvent).filter(database.CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento não encontrado")
    
    db.delete(event)
    db.commit()
    return None

# ==================== HEALTH CHECK ====================

@app.get("/")
async def root():
    return {
        "app": "Kalu Dashboard API",
        "version": "2.0.0",
        "status": "operational",
        "message": "API pronta para uso ⚡",
        "features": [
            "Tasks Management",
            "Activity Feed",
            "Documents Library",
            "Memory System",
            "Calendar Events"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
