from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError # To catch potential race conditions if needed

from ..database import get_db
from ..schemas.user import User as UserSchema, UserCreate
from ..crud.user import create_user as crud_create_user, get_user_by_username as crud_get_user_by_username
from ..core.security import create_access_token, verify_password
from ..core.config import ACCESS_TOKEN_EXPIRE_MINUTES # For timedelta if needed directly here
from datetime import timedelta

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post("/users/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    db_user = crud_get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    try:
        created_user = crud_create_user(db=db, user=user)
    except IntegrityError: # Should be rare if check above is done, but good for race conditions
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered (race condition)",
        )
    return created_user

@router.post("/token") # Standard token endpoint path
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """
    Login to get an access token.
    """
    user = crud_get_user_by_username(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
