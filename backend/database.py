from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kalu.db")

# SQLAlchemy setup
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descricao = Column(Text)
    empresa = Column(String, nullable=False)
    prioridade = Column(String, default="Média")  # Alta, Média, Baixa
    status = Column(String, default="Pendente")  # Pendente, Em Progresso, Concluído, Bloqueado
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, default="Oscar")
    assigned_to = Column(String, default="Kalu")
    
    # Resultados
    resultado = Column(Text)  # JSON, texto, ou link
    resultado_tipo = Column(String)  # json, text, file, image
    resultado_url = Column(String)  # URL se ficheiro externo
    
    # Metadata
    tags = Column(String)  # comma-separated
    deadline = Column(DateTime)
    completado_em = Column(DateTime)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Activity(Base):
    """Activity Feed - histórico de tudo que acontece no sistema"""
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)  # task_created, task_completed, document_generated, etc.
    titulo = Column(String, nullable=False)
    descricao = Column(Text)
    actor = Column(String, default="Kalu")  # quem fez a ação
    target_id = Column(Integer)  # ID da entidade relacionada (task, doc, etc.)
    target_type = Column(String)  # 'task', 'document', 'memory'
    extra_data = Column(Text)  # JSON com dados adicionais
    created_at = Column(DateTime, default=datetime.utcnow)
    icon = Column(String, default="📌")  # emoji para o feed

class Document(Base):
    """Biblioteca de Deliverables - todos os ficheiros gerados"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descricao = Column(Text)
    tipo = Column(String, nullable=False)  # json, pdf, docx, xlsx, html, image
    conteudo = Column(Text)  # conteúdo do ficheiro (se texto)
    file_path = Column(String)  # caminho no filesystem ou URL
    file_size = Column(Integer)  # tamanho em bytes
    empresa = Column(String)
    projeto = Column(String)  # Delabento IA, IMPULSO, etc.
    task_id = Column(Integer)  # relação com tarefa (opcional)
    tags = Column(String)  # comma-separated
    versao = Column(String, default="v1")  # versionamento
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String, default="Kalu")

class Memory(Base):
    """Memory - contexto conversacional e decisões"""
    __tablename__ = "memories"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)  # conversation, decision, lesson, fact
    titulo = Column(String, nullable=False)
    conteudo = Column(Text, nullable=False)
    categoria = Column(String)  # business, technical, personal, etc.
    importancia = Column(String, default="normal")  # low, normal, high, critical
    empresa = Column(String)
    tags = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CalendarEvent(Base):
    """Calendar - eventos e tarefas agendadas"""
    __tablename__ = "calendar_events"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False)
    descricao = Column(Text)
    tipo = Column(String, default="task")  # task, meeting, deadline, reminder
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    all_day = Column(Boolean, default=False)
    empresa = Column(String)
    task_id = Column(Integer)  # relação com tarefa
    recorrente = Column(Boolean, default=False)
    recorrencia = Column(String)  # daily, weekly, monthly
    cor = Column(String, default="#3b82f6")  # cor no calendário
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
