from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship # Optional: if you want to define relationships like Account.ledger_entries

from ..database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False) # e.g., "asset", "liability", "equity", "revenue", "expense"
    
    # Optional: Relationship to ledger entries
    # ledger_entries = relationship("LedgerEntry", back_populates="account")

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False) # Positive for debit, negative for credit (convention)
    
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    
    # Optional: Relationship back to account
    # account = relationship("Account", back_populates="ledger_entries")
