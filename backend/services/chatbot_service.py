import asyncio,uuid
from database import company_insights_collection
from sentence_transformers import SentenceTransformer

# Loading a Sentence Transformer (Light-weight model for efficiency)
model = SentenceTransformer("all-MiniLM-L6-v2")

companies = [
    {
        "id":"c01",
        "name":"Google",
        "description":{
            "roles":[],
            "jds":[],
            "packages":[]
        }
    }
]