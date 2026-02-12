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
