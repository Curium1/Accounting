from sqlalchemy.orm import Session
from typing import List

from ..models.accounting import Account as AccountModel, LedgerEntry as LedgerEntryModel
from ..schemas.accounting import AccountCreate, LedgerEntryCreate

def create_account(db: Session, account: AccountCreate) -> AccountModel:
    db_account = AccountModel(
        number=account.number,
        name=account.name,
        type=account.type
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def get_accounts(db: Session, skip: int = 0, limit: int = 100) -> List[AccountModel]:
    return db.query(AccountModel).offset(skip).limit(limit).all()

def get_account_by_number(db: Session, number: str) -> AccountModel | None:
    return db.query(AccountModel).filter(AccountModel.number == number).first()

def create_ledger_entry(db: Session, entry: LedgerEntryCreate) -> LedgerEntryModel:
    # Here, you might add logic to check if entry.account_id exists,
    # or let the database handle foreign key constraints.
    # For simplicity, we'll assume valid account_id is provided.
    db_ledger_entry = LedgerEntryModel(
        date=entry.date,
        description=entry.description,
        account_id=entry.account_id,
        amount=entry.amount
    )
    db.add(db_ledger_entry)
    db.commit()
    db.refresh(db_ledger_entry)
    return db_ledger_entry

def get_ledger_entries(db: Session, skip: int = 0, limit: int = 100) -> List[LedgerEntryModel]:
    return db.query(LedgerEntryModel).order_by(LedgerEntryModel.date.desc()).offset(skip).limit(limit).all()

# Optional: get_ledger_entries_by_account
def get_ledger_entries_by_account(db: Session, account_id: int, skip: int = 0, limit: int = 100) -> List[LedgerEntryModel]:
    return db.query(LedgerEntryModel)\
        .filter(LedgerEntryModel.account_id == account_id)\
        .order_by(LedgerEntryModel.date.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
