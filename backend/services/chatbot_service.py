import asyncio
from models.chatbot_model import ChatbotModel
from database import company_insights_collection, company_stats_collection


from utils.embedding_model import get_embedding_model
from utils.cache import get_cached_response, set_cached_response
from utils.llm import query_ollama
from utils.nlp import extract_entities

# Chatbot Services

async def get_chatbot_answer(query: str):
    # 1. Check Cache
    cached_response = get_cached_response(query)
    if cached_response:
        return {"answer": cached_response["answer"], "source": "cache"}

    # 2. Extract Entities
    entities = extract_entities(query)
    company = None
    year = None

    for text, label in entities:
        if label == "ORG":
            company = text
        elif label == "DATE" and text.isdigit():
            year = text

    # 3. Query ChromaDB (company_insights_collection)
    model = get_embedding_model()
    query_embedding = model.encode(query).tolist()

    results = await asyncio.to_thread(
        company_insights_collection.query,
        query_embeddings=[query_embedding],
        n_results=5,
    )
    chroma_context = "\n\n".join(results["documents"][0])

    # 4. Try to get extra context from company_stats_collection
    stats_context = ""
    try:
        if company or year:
            stats_query = {}
            if company:
                stats_query["company_name"] = company.upper()
            if year:
                stats_query["year"] = year

            stats_data = await asyncio.to_thread(
                lambda: list(company_stats_collection.find(stats_query))
            )

            if stats_data:
                stats_context = "\n\n".join([
                    f"Company: {doc.get('company_name')}, Year: {doc.get('year')}, Stats: {doc.get('stats', '')}"
                    for doc in stats_data
                ])
    except Exception as e:
        # Log error or ignore silently
        print(f"[WARN] Failed to fetch from stats collection: {e}")

    # 5. Create final context for LLM
    combined_context = "\n\n".join(filter(None, [chroma_context, stats_context]))

    prompt = f"""
                You are an AI-powered Placements Assistance Chatbot designed to help college students understand company-specific hiring information based on provided data.

                Your role:
                - Act as a knowledgeable assistant for student placement-related queries.
                - Answer only using the context provided.
                - Never fabricate or assume any data not present in the context.

                Instructions:
                1. Read the context carefully and extract all relevant facts.
                2. Understand the student’s intent from their query.
                3. Respond clearly and concisely with helpful information.
                4. If possible, format the answer into bullet points or short paragraphs for better readability.
                5. If the query includes a company name or year, ensure that information aligns with the context.
                6. If the context lacks enough information, reply:  
                    _"I'm sorry, I couldn't find specific information in our records to answer that right now."_

                Tone:
                - Friendly and student-centric.
                - Clear, precise, and factual.

                Context:
                {combined_context}

                Student Query:
                {query}

                Answer:"""


    # 6. Generate response from Ollama
    answer = await asyncio.to_thread(query_ollama, prompt)

    response = {"answer": answer, "source": "llm"}

    # 7. Cache 
    if answer and response["source"] == "llm" and "Sorry" not in answer:
        set_cached_response(query, response)

    return response