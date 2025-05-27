from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.security import oauth2_scheme, decode_access_token
from ..database import get_db
from ..models.user import User as UserModel
from ..crud.user import get_user_by_username as crud_get_user_by_username
# from ..schemas.user import User as UserSchema # If you prefer to return schema

async def get_current_active_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)]
) -> UserModel: # Or UserSchema if you prefer
    """
    Decodes the JWT token, fetches the user from the database,
    and returns the active user.
    Raises HTTPException if the token is invalid or the user is not found.
    """
    username = decode_access_token(token) # This already raises HTTPException for invalid token
    
    user = crud_get_user_by_username(db, username=username)
    if user is None:
        # This case means the token was valid (e.g., not expired, correct signature)
        # but the user ID/username in the token payload does not exist in the DB.
        # This could happen if a user was deleted after the token was issued.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, # Or 404 if that's more appropriate semantically
            detail="User not found for the given token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Optional: Add check for user activity status if your UserModel has it
    # if not user.is_active:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
        
    return user
