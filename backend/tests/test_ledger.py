from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Use absolute imports
from backend.database import override_get_db
from backend.models.accounting import Account as AccountModel

# Test data for accounts
test_account_data_1 = {"number": "1001", "name": "Cash", "type": "asset"}
test_account_data_2 = {"number": "2001", "name": "Accounts Payable", "type": "liability"}
test_account_data_duplicate = {"number": "1001", "name": "Cash Equivalent", "type": "asset"}

# Test data for ledger entries
# Note: account_id will be set dynamically after creating an account
test_ledger_entry_data_1 = {"date": "2024-01-15", "description": "Initial cash deposit", "amount": 1000.00}
test_ledger_entry_data_2 = {"date": "2024-01-16", "description": "Office supplies purchase", "amount": -50.00}


# --- Account Management Tests ---

def test_create_account_success(authenticated_client: TestClient):
    # Clean up existing account if it exists from a previous failed run or for idempotency
    db = next(override_get_db())
    existing_acc = db.query(AccountModel).filter(AccountModel.number == test_account_data_1["number"]).first()
    if existing_acc:
        db.delete(existing_acc)
        db.commit()
    db.close()

    response = authenticated_client.post("/ledger/accounts/", json=test_account_data_1)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["number"] == test_account_data_1["number"]
    assert data["name"] == test_account_data_1["name"]
    assert data["type"] == test_account_data_1["type"]
    assert "id" in data


def test_list_accounts(authenticated_client: TestClient):
    # Create a second account to ensure listing works with multiple items
    # (Assume test_account_data_1 might exist from previous tests or create it)
    db = next(override_get_db())
    existing_acc_1 = db.query(AccountModel).filter(AccountModel.number == test_account_data_1["number"]).first()
    if not existing_acc_1:
         authenticated_client.post("/ledger/accounts/", json=test_account_data_1) # ensure it exists

    existing_acc_2 = db.query(AccountModel).filter(AccountModel.number == test_account_data_2["number"]).first()
    if not existing_acc_2:
        authenticated_client.post("/ledger/accounts/", json=test_account_data_2)
    db.close()
        
    response = authenticated_client.get("/ledger/accounts/")
    assert response.status_code == 200, response.text
    data = response.json()
    assert isinstance(data, list)
    # Check if at least one of the created accounts is in the list
    # This is a bit loose; better tests might check for specific content if DB state is strictly controlled
    assert any(acc["number"] == test_account_data_1["number"] for acc in data) or \
           any(acc["number"] == test_account_data_2["number"] for acc in data)


def test_create_account_duplicate_number(authenticated_client: TestClient):
    # Ensure the first account exists
    db = next(override_get_db())
    existing_acc = db.query(AccountModel).filter(AccountModel.number == test_account_data_1["number"]).first()
    if not existing_acc:
        authenticated_client.post("/ledger/accounts/", json=test_account_data_1)
    db.close()

    # Attempt to create an account with the same number
    response = authenticated_client.post("/ledger/accounts/", json=test_account_data_duplicate)
    assert response.status_code == 400, response.text
    data = response.json()
    assert "already exists" in data["detail"]


def test_access_accounts_unauthenticated(client: TestClient):
    response = client.get("/ledger/accounts/")
    assert response.status_code == 401, response.text # Expect 401 Unauthorized


# --- Ledger Entry Management Tests ---

def test_create_ledger_entry_success(authenticated_client: TestClient):
    # Ensure an account exists to link the entry to
    db = next(override_get_db())
    account = db.query(AccountModel).filter(AccountModel.number == test_account_data_1["number"]).first()
    if not account:
        acc_response = authenticated_client.post("/ledger/accounts/", json=test_account_data_1)
        account_id = acc_response.json()["id"]
    else:
        account_id = account.id
    db.close()

    entry_payload = {**test_ledger_entry_data_1, "account_id": account_id}
    response = authenticated_client.post("/ledger/ledger-entries/", json=entry_payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["description"] == test_ledger_entry_data_1["description"]
    assert data["amount"] == test_ledger_entry_data_1["amount"]
    assert data["account_id"] == account_id
    assert "id" in data


def test_list_ledger_entries(authenticated_client: TestClient):
    # Potentially create an entry if none guaranteed to exist
    # For simplicity, assume test_create_ledger_entry_success ran or DB has some entries
    response = authenticated_client.get("/ledger/ledger-entries/")
    assert response.status_code == 200, response.text
    data = response.json()
    assert isinstance(data, list)
    # If an entry was created in test_create_ledger_entry_success, it should be in this list
    # This test is basic; more specific checks would require more controlled data setup


def test_access_ledger_entries_unauthenticated(client: TestClient):
    response = client.get("/ledger/ledger-entries/")
    assert response.status_code == 401, response.text # Expect 401 Unauthorized
