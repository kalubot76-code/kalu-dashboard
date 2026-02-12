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
