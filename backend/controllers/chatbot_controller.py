from fastapi import APIRouter, Query, HTTPException
from typing import List
from models.chatbot_model import ChatbotModel
from services.chatbot_service import ( get_chatbot_answer )

router = APIRouter()

# Chatbot Controllers

# Get Chatbot Answer
@router.get("/get-chatbot-answer")
async def fetch_chatbot_response(query: str):
    try:
        res = await get_chatbot_answer(query)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching answer: {str(e)}")