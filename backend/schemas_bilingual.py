from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional, Any

# ====== TASK SCHEMAS (Bilíngue PT/EN) ======

class TaskCreate(BaseModel):
    """Schema bilíngue para criação de Task - aceita PT ou EN"""
    titulo: str = Field(..., alias="title")
    descricao: Optional[str] = Field(None, alias="description")
    empresa: str = Field(..., alias="company")
    prioridade: str = Field("Média", alias="priority")
    status: str = Field("Pendente")
    tags: Optional[str] = None
    deadline: Optional[datetime] = None
    
    class Config:
        populate_by_name = True  # Aceita tanto 'titulo' quanto 'title'

class TaskUpdate(BaseModel):
    """Schema bilíngue para update de Task"""
    titulo: Optional[str] = Field(None, alias="title")
    descricao: Optional[str] = Field(None, alias="description")
    empresa: Optional[str] = Field(None, alias="company")
    prioridade: Optional[str] = Field(None, alias="priority")
    status: Optional[str] = None
    tags: Optional[str] = None
    deadline: Optional[datetime] = None
    
    class Config:
        populate_by_name = True

class TaskResult(BaseModel):
    resultado: str = Field(..., alias="result")
    resultado_tipo: str = Field(..., alias="result_type")
    resultado_url: Optional[str] = Field(None, alias="result_url")
    
    class Config:
        populate_by_name = True

class Task(BaseModel):
    """Schema de Task para response"""
    id: int
    titulo: str
    descricao: Optional[str] = None
    empresa: str
    prioridade: str
    status: str
    tags: Optional[str] = None
    deadline: Optional[datetime] = None
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

# ====== DOCUMENT SCHEMAS (Bilíngue) ======

class DocumentCreate(BaseModel):
    """Schema bilíngue para criação de Document"""
    titulo: str = Field(..., alias="title")
    tipo: str = Field(..., alias="doc_type")
    conteudo: Optional[str] = Field(None, alias="content")
    descricao: Optional[str] = Field(None, alias="description")
    empresa: Optional[str] = Field(None, alias="company")
    projeto: Optional[str] = Field(None, alias="project")
    task_id: Optional[int] = None
    tags: Optional[str] = None
    versao: str = Field("v1", alias="version")
    file_path: Optional[str] = None
    
    class Config:
        populate_by_name = True

class Document(BaseModel):
    """Schema de Document para response"""
    id: int
    titulo: str
    tipo: str
    conteudo: Optional[str] = None
    descricao: Optional[str] = None
    empresa: Optional[str] = None
    projeto: Optional[str] = None
    task_id: Optional[int] = None
    tags: Optional[str] = None
    versao: str
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    created_at: datetime
    created_by: str
    
    class Config:
        from_attributes = True

# ====== MEMORY SCHEMAS (Bilíngue) ======

class MemoryCreate(BaseModel):
    """Schema bilíngue para criação de Memory"""
    tipo: str = Field(..., alias="type")
    titulo: str = Field(..., alias="title")
    conteudo: str = Field(..., alias="content")
    categoria: Optional[str] = Field(None, alias="category")
    importancia: str = Field("normal", alias="importance")
    empresa: Optional[str] = Field(None, alias="company")
    tags: Optional[str] = None
    contexto: Optional[str] = Field(None, alias="context")
    
    @field_validator('tipo', mode='before')
    @classmethod
    def validate_tipo(cls, v: Any) -> str:
        """Normalizar tipo para português"""
        type_map = {
            'conversation': 'conversa',
            'decision': 'decisão',
            'lesson': 'lição',
            'fact': 'facto'
        }
        return type_map.get(str(v).lower(), str(v))
    
    @field_validator('importancia', mode='before')
    @classmethod
    def validate_importancia(cls, v: Any) -> str:
        """Normalizar importância para português"""
        importance_map = {
            'low': 'baixa',
            'normal': 'normal',
            'high': 'alta',
            'critical': 'crítica'
        }
        return importance_map.get(str(v).lower(), str(v))
    
    class Config:
        populate_by_name = True

class Memory(BaseModel):
    """Schema de Memory para response"""
    id: int
    tipo: str
    titulo: str
    conteudo: str
    categoria: Optional[str] = None
    importancia: str
    empresa: Optional[str] = None
    tags: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ====== ACTIVITY SCHEMAS (Bilíngue) ======

class ActivityCreate(BaseModel):
    """Schema bilíngue para criação de Activity"""
    tipo: str = Field(..., alias="type")
    titulo: str = Field(..., alias="title")
    descricao: Optional[str] = Field(None, alias="description")
    actor: str = "Kalu"
    target_id: Optional[int] = None
    target_type: Optional[str] = None
    extra_data: Optional[str] = None
    icon: str = "📌"
    
    class Config:
        populate_by_name = True

class Activity(BaseModel):
    """Schema de Activity para response"""
    id: int
    tipo: str
    titulo: str
    descricao: Optional[str] = None
    actor: str
    target_id: Optional[int] = None
    target_type: Optional[str] = None
    extra_data: Optional[str] = None
    icon: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ====== CALENDAR SCHEMAS (Bilíngue) ======

class CalendarEventCreate(BaseModel):
    """Schema bilíngue para criação de Calendar Event"""
    titulo: str = Field(..., alias="title")
    start_date: datetime
    tipo: str = Field("task", alias="type")
    descricao: Optional[str] = Field(None, alias="description")
    end_date: Optional[datetime] = None
    all_day: bool = False
    empresa: Optional[str] = Field(None, alias="company")
    task_id: Optional[int] = None
    recorrente: bool = Field(False, alias="recurring")
    recorrencia: Optional[str] = Field(None, alias="recurrence")
    cor: str = Field("#3b82f6", alias="color")
    
    class Config:
        populate_by_name = True

class CalendarEvent(BaseModel):
    """Schema de Calendar Event para response"""
    id: int
    titulo: str
    start_date: datetime
    tipo: str
    descricao: Optional[str] = None
    end_date: Optional[datetime] = None
    all_day: bool
    empresa: Optional[str] = None
    task_id: Optional[int] = None
    recorrente: bool
    recorrencia: Optional[str] = None
    cor: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ====== USER SCHEMAS (já em inglês, manter) ======

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

# ====== AUTH SCHEMAS ======

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
