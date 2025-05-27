from typing import List, Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.accounting import (
    Account as AccountSchema,
    AccountCreate,
    LedgerEntry as LedgerEntrySchema,
    LedgerEntryCreate
)
from ..crud.accounting import (
    create_account as crud_create_account,
    get_accounts as crud_get_accounts,
    get_account_by_number as crud_get_account_by_number,
    create_ledger_entry as crud_create_ledger_entry,
    get_ledger_entries as crud_get_ledger_entries
)
from ..core.dependencies import get_current_active_user
from ..models.user import User as UserModel # For type hinting current_user

router = APIRouter(
    prefix="/ledger",
    tags=["Ledger & Accounts"],
    dependencies=[Depends(get_current_active_user)] # Apply auth to all routes
)

@router.post("/accounts/", response_model=AccountSchema, status_code=status.HTTP_201_CREATED)
async def create_new_account(
    account: AccountCreate,
    db: Annotated[Session, Depends(get_db)],
    # current_user: Annotated[UserModel, Depends(get_current_active_user)] # Already in router dependencies
):
    """
    Create a new account.
    """
    db_account = crud_get_account_by_number(db, number=account.number)
    if db_account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Account with number '{account.number}' already exists."
        )
    return crud_create_account(db=db, account=account)

@router.get("/accounts/", response_model=List[AccountSchema])
async def read_accounts(
    skip: int = 0,
    limit: int = 100,
    db: Annotated[Session, Depends(get_db)],
    # current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Retrieve a list of accounts.
    """
    accounts = crud_get_accounts(db, skip=skip, limit=limit)
    return accounts

@router.post("/ledger-entries/", response_model=LedgerEntrySchema, status_code=status.HTTP_201_CREATED)
async def create_new_ledger_entry(
    entry: LedgerEntryCreate,
    db: Annotated[Session, Depends(get_db)],
    # current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Create a new ledger entry.
    Requires valid account_id.
    """
    # Optional: Validate if entry.account_id exists
    # account = db.query(AccountModel).filter(AccountModel.id == entry.account_id).first()
    # if not account:
    #     raise HTTPException(status_code=400, detail=f"Account with id {entry.account_id} not found.")
    return crud_create_ledger_entry(db=db, entry=entry)

@router.get("/ledger-entries/", response_model=List[LedgerEntrySchema])
async def read_ledger_entries(
    skip: int = 0,
    limit: int = 100,
    db: Annotated[Session, Depends(get_db)],
    # current_user: Annotated[UserModel, Depends(get_current_active_user)]
):
    """
    Retrieve a list of ledger entries.
    """
    ledger_entries = crud_get_ledger_entries(db, skip=skip, limit=limit)
    return ledger_entries
