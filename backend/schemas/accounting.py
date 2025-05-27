from pydantic import BaseModel
from datetime import date
from typing import Literal

# Define allowed account types
AccountType = Literal["asset", "liability", "equity", "revenue", "expense"]

class AccountBase(BaseModel):
    number: str
    name: str
    type: AccountType

class AccountCreate(AccountBase):
    pass

class Account(AccountBase):
    id: int

    class Config:
        orm_mode = True

class LedgerEntryBase(BaseModel):
    date: date
    description: str
    account_id: int # Foreign key to Account.id
    amount: float   # Positive for debit, negative for credit (or vice-versa, document convention)
                    # For this basic step, we'll assume business logic dictates interpretation.

class LedgerEntryCreate(LedgerEntryBase):
    pass

class LedgerEntry(LedgerEntryBase):
    id: int

    class Config:
        orm_mode = True
