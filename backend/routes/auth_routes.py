from fastapi import APIRouter
from controllers.auth_controller import router as auth_controller

router = APIRouter()
router.include_router(auth_controller, prefix="/auth", tags=["Authorization"])
