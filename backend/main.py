from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta, datetime

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
        # Verificar se já existe
        existing = db.query(database.User).filter(database.User.username == "Oscar").first()
        if not existing:
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

# ==================== HEALTH CHECK ====================

@app.get("/")
async def root():
    return {
        "app": "Kalu Dashboard API",
        "version": "2.0.0",
        "status": "operational",
        "message": "API pronta para uso ⚡"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
