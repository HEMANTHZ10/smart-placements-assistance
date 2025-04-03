from fastapi import APIRouter
from controllers.dashboard_controller import router as dashboard_controller_router
from controllers.chatbot_controller import router as chatbot_controller_router

router=APIRouter()

router.include_router(dashboard_controller_router,prefix="/dashboard",tags=["Dashboard"])
router.include_router(chatbot_controller_router,prefix="/chatbot",tags=["Chatbot"])