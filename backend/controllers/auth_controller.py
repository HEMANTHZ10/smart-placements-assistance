from fastapi import APIRouter, HTTPException,Form
from services.auth_service import create_access_token
from models.auth_model import LoginRequest

router = APIRouter()

import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_USERNAME = os.getenv("ADMIN_CREDS")
ADMIN_PASSWORD = os.getenv("ADMIN_PASS")

# @router.post("/login")
# async def login(request: LoginRequest):
#     if request.username == ADMIN_USERNAME and request.password == ADMIN_PASSWORD:
#         access_token = create_access_token(data={"sub": request.username})
#         return {"access_token": access_token, "token_type": "bearer"}
#     else:
#         raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        access_token = create_access_token(data={"sub": username})
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

