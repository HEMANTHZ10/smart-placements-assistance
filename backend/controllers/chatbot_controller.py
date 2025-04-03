from fastapi import APIRouter,HTTPException,Query
import ollama
from sentence_transformers import SentenceTransformer

router = APIRouter()