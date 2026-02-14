from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# Task Schemas
class TaskBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    empresa: str
    prioridade: str = "Média"
    status: str = "Pendente"
    tags: Optional[str] = None
    deadline: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    empresa: Optional[str] = None
    prioridade: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[str] = None
    deadline: Optional[datetime] = None

class TaskResult(BaseModel):
    resultado: str
    resultado_tipo: str  # json, text, file, image
    resultado_url: Optional[str] = None

class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: str
    assigned_to: str
    resultado: Optional[str] = None
    resultado_tipo: Optional[str] = None
    resultado_url: Optional[str] = None
    completado_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Activity Schemas
class ActivityBase(BaseModel):
    tipo: str
    titulo: str
    descricao: Optional[str] = None
    actor: str = "Kalu"
    target_id: Optional[int] = None
    target_type: Optional[str] = None
    extra_data: Optional[str] = None
    icon: str = "📌"

class Activity(ActivityBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Document Schemas
class DocumentBase(BaseModel):
    titulo: str
    tipo: str
    conteudo: Optional[str] = None
    descricao: Optional[str] = None
    empresa: Optional[str] = None
    projeto: Optional[str] = None
    task_id: Optional[int] = None
    tags: Optional[str] = None
    versao: str = "v1"

class Document(DocumentBase):
    id: int
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    created_at: datetime
    created_by: str
    
    class Config:
        from_attributes = True

# Memory Schemas
class MemoryBase(BaseModel):
    tipo: str
    titulo: str
    conteudo: str
    categoria: Optional[str] = None
    importancia: str = "normal"
    empresa: Optional[str] = None
    tags: Optional[str] = None

class Memory(MemoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Calendar Schemas
class CalendarEventBase(BaseModel):
    titulo: str
    start_date: datetime
    tipo: str = "task"
    descricao: Optional[str] = None
    end_date: Optional[datetime] = None
    all_day: bool = False
    empresa: Optional[str] = None
    task_id: Optional[int] = None
    recorrente: bool = False
    recorrencia: Optional[str] = None
    cor: str = "#3b82f6"

class CalendarEvent(CalendarEventBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
