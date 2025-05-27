from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Use absolute imports
# from backend.main import app # app is usually not needed directly in tests, client uses it
from backend.models.user import User as UserModel
from backend.core.security import get_password_hash, verify_password
from backend.database import override_get_db # Base, engine might not be needed directly here

# Test data
test_user_data = {"username": "testuser1@example.com", "password": "testpassword1"}
test_user_data_alt = {"username": "testuser2@example.com", "password": "testpassword2"}


def test_create_user_success(client: TestClient):
    # Clean up any potential user from other tests if DB is not reset per test
    db = next(override_get_db())
    existing_user = db.query(UserModel).filter(UserModel.username == test_user_data["username"]).first()
    if existing_user:
        db.delete(existing_user)
        db.commit()
    db.close()

    response = client.post("/auth/users/", json=test_user_data)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["username"] == test_user_data["username"]
    assert "id" in data
    # Hashed password should not be returned
    assert "hashed_password" not in data 
    assert "password" not in data


def test_create_user_existing_username(client: TestClient):
    # First, create a user
    client.post("/auth/users/", json=test_user_data_alt) # Use alt user to avoid conflict with other tests
    
    # Attempt to create the same user again
    response = client.post("/auth/users/", json=test_user_data_alt)
    assert response.status_code == 400, response.text
    data = response.json()
    assert data["detail"] == "Username already registered"


def test_login_success(client: TestClient):
    # Ensure user exists (can be created here or assume from test_create_user_success if tests run in order and DB persists)
    # For robust tests, ensure user creation or use a dedicated test user from conftest.
    # Here, we'll use the user created in conftest for the 'authenticated_client'
    # but this test uses the unauthenticated 'client', so we need to ensure a user.
    
    # Create user first (if not using a shared test user created elsewhere)
    initial_user = {"username": "login_test@example.com", "password": "login_password"}
    db = next(override_get_db())
    existing_user = db.query(UserModel).filter(UserModel.username == initial_user["username"]).first()
    if not existing_user:
        client.post("/auth/users/", json=initial_user)
    db.close()

    login_payload = {"username": initial_user["username"], "password": initial_user["password"]}
    response = client.post("/auth/token", data=login_payload) # FastAPI OAuth2PasswordRequestForm uses form data
    
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_username(client: TestClient):
    login_payload = {"username": "nonexistentuser@example.com", "password": "testpassword"}
    response = client.post("/auth/token", data=login_payload)
    assert response.status_code == 401, response.text # Or 400 depending on your specific error handling
    data = response.json()
    assert data["detail"] == "Incorrect username or password"


def test_login_invalid_password(client: TestClient):
    # Ensure user exists
    user_data = {"username": "user_for_wrong_pass_test@example.com", "password": "correctpassword"}
    db = next(override_get_db())
    existing_user = db.query(UserModel).filter(UserModel.username == user_data["username"]).first()
    if not existing_user:
        client.post("/auth/users/", json=user_data)
    db.close()

    login_payload = {"username": user_data["username"], "password": "wrongpassword"}
    response = client.post("/auth/token", data=login_payload)
    assert response.status_code == 401, response.text # Or 400
    data = response.json()
    assert data["detail"] == "Incorrect username or password"

# Optional: Test password hashing utilities
def test_password_hashing():
    password = "mypassword123"
    hashed_password = get_password_hash(password)
    assert hashed_password != password # Should be hashed
    assert verify_password(password, hashed_password) == True
    assert verify_password("wrongpassword", hashed_password) == False
