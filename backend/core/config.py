import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file if present

# It's good practice to generate a strong secret key, e.g., using:
# import secrets
# secrets.token_hex(32)
# For this example, we'll use a placeholder.
# In a real application, this should be loaded from environment variables.
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-please-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
