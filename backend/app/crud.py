from sqlalchemy.orm import Session
from . import models, schemas, auth

# --- CRUD de Usuários ---

def get_user(db: Session, user_id: int):
    """Busca um usuário pelo ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """Busca um usuário pelo email."""
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    """Busca um usuário pelo nome de usuário."""
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    """Cria um novo usuário no banco de dados com senha hasheada."""
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- CRUD de Itens ---

def get_items(db: Session, skip: int = 0, limit: int = 100):
    """Lista itens com paginação simples."""
    return db.query(models.Item).offset(skip).limit(limit).all()

def create_user_item(db: Session, item: schemas.ItemCreate, user_id: int):
    """Cria um novo item associado a um usuário."""
    db_item = models.Item(**item.model_dump(), owner_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
