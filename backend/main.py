from fastapi import FastAPI
from .database import create_db_and_tables
from .routers import auth_router, ledger_router # Import routers

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    create_db_and_tables()

app.include_router(auth_router) # Include the authentication router
app.include_router(ledger_router) # Include the ledger router

@app.get("/")
async def root():
    return {"message": "Hello World"}
