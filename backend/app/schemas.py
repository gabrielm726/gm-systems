from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str

class ItemCreate(BaseModel):
    title: str
    description: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
