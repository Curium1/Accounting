import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Use absolute imports assuming 'backend' is in PYTHONPATH or discoverable
from backend.main import app
from backend.database import Base, get_db
from backend.models.user import User as UserModel
from backend.core.security import get_password_hash
from backend.schemas.user import UserCreate

# In-memory SQLite database URL for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}, # Required for SQLite
    poolclass=StaticPool, # Recommended for SQLite in-memory for tests
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency for testing
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Apply the override for the whole test session
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """
    Create database tables once per session.
    'autouse=True' makes this fixture run automatically.
    """
    Base.metadata.create_all(bind=engine)
    yield # Test session runs
    Base.metadata.drop_all(bind=engine) # Clean up after tests if needed, or let in-memory db disappear

@pytest.fixture(scope="function") # function scope for TestClient ensures clean state
def client(setup_test_db): # Depend on setup_test_db to ensure tables are created
    """
    Provides a TestClient instance for making requests to the FastAPI app.
    """
    # Clear any existing overrides from other tests if necessary, though usually function scope is enough
    # app.dependency_overrides = {} 
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as c:
        yield c
    
    # Clean up or reset state after each test if needed, e.g., clear tables
    # For in-memory, this might not be strictly necessary if tables are recreated per session
    # but if you want per-test table isolation:
    # Base.metadata.drop_all(bind=engine)
    # Base.metadata.create_all(bind=engine)


@pytest.fixture(scope="function")
def authenticated_client(client: TestClient): # Depends on the unauthenticated client fixture
    """
    Provides an authenticated TestClient.
    Creates a test user and logs them in.
    """
    test_username = "testuser@example.com"
    test_password = "testpassword"

    # Create user directly in the test database (or via API if preferred, but direct is often simpler for setup)
    db = next(override_get_db()) # Get a session
    
    # Check if user already exists from a previous test in the same session (if not dropping tables per test)
    existing_user = db.query(UserModel).filter(UserModel.username == test_username).first()
    if not existing_user:
        user_in = UserCreate(username=test_username, password=test_password)
        hashed_password = get_password_hash(user_in.password)
        db_user = UserModel(username=user_in.username, hashed_password=hashed_password)
        db.add(db_user)
        db.commit()
    db.close()

    # Login to get token
    login_data = {"username": test_username, "password": test_password}
    response = client.post("/auth/token", data=login_data)
    
    assert response.status_code == 200, f"Failed to login test user: {response.json()}"
    token_data = response.json()
    access_token = token_data["access_token"]

    # Set authorization header for this client instance
    client.headers["Authorization"] = f"Bearer {access_token}"
    
    return client
