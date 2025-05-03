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
        filters = {}

        if company:
            filters["company_name"] = company.upper()
        if year:
            filters["year"] = int(year)

        # Apply the filters to build conditions
        if filters:
            if len(filters) == 1:
                # If there's only one filter, directly apply equality condition
                key, value = next(iter(filters.items()))
                conditions = {key: {"$eq": value}}
            else:
                # If there are multiple filters, combine them with $and
                conditions = {"$and": [{key: {"$eq": value}} for key, value in filters.items()]}
        else:
            # If no filters, query all records
            conditions = {}

        # Query the stats collection with the constructed conditions
        stats_data = await asyncio.to_thread(
            lambda: company_stats_collection.get(where=conditions) if filters else company_stats_collection.get()
        )

        # Extract metadata if available
        metadatas = stats_data.get("metadatas", [])

        if metadatas:
            stats_context = "\n\n".join([
                (
                    f"Company: {meta.get('company_name')}, Year: {meta.get('year')}\n"
                    f"Salary: {meta.get('salary', 'N/A')} LPA, Internship PPOs: {meta.get('internship_ppo', 'N/A')}\n"
                    f"Total Offers: {meta.get('total_offers', 0)}\n"
                    f"Branch-wise Offers: CSE: {meta.get('CSE', 0)}, CSBS: {meta.get('CSBS', 0)}, "
                    f"CYS: {meta.get('CYS', 0)}, AIML: {meta.get('AIML', 0)}, DS: {meta.get('DS', 0)}, "
                    f"IOT: {meta.get('IOT', 0)}, IT: {meta.get('IT', 0)}, ECE: {meta.get('ECE', 0)}, "
                    f"EEE: {meta.get('EEE', 0)}, EIE: {meta.get('EIE', 0)}, MECH: {meta.get('MECH', 0)}, "
                    f"CIVIL: {meta.get('CIVIL', 0)}, AUTO: {meta.get('AUTO', 0)}"
                )
                for meta in metadatas
            ])
    except Exception as e:
        print(f"[WARN] Failed to fetch from stats collection: {e}")
    print(f"Stats Context: {stats_context}")

    # 5. Create final context for LLM
    combined_context = "\n\n".join(filter(None, [chroma_context, stats_context]))

    prompt = f"""
                You are an AI-powered Placements Assistance Chatbot designed to help college students understand company-specific hiring information based on provided data.

                Your role:
                - Act as a knowledgeable assistant for student placement-related queries.
                - Answer only using the context provided.
                - Never fabricate or assume any data not present in the context.
                - Never hallucinate or generate responses by guessing or assuming, if enough context is not provided just reply with the fall back message.
                - Never answer/respond to a query by using your own general knowledge, use only the context provided.

                Instructions:
                1. Read the context carefully and extract all relevant facts.
                2. Understand the student’s intent from their query.
                3. Respond clearly and concisely with helpful information.
                4. If possible, format the answer into bullet points or short paragraphs for better readability.
                5. If the query includes a company name or year, ensure that information aligns with the context.
                6. If the stats_context is empty and chroma_context is not, use chroma_context to answer.
                7. If the chroma_context is empty and stats_context is not, use stats_context to answer.
                8. If stats_context is empty and the query is regarding any company stats then reply : _"I'm sorry, I couldn't find the company's details for mentioned year."_
                7. If the context lacks enough information, reply:  
                    _"I'm sorry, I couldn't find specific information in our records to answer that right now."_
                8. Do NOT include both an answer and the fallback message. If some information is present, respond with that only.
                9. Do NOT include the phrases like "According to the provided data" or "Based on the context" or "Based on the information provided" in your response, instead include phrases like "As per my knowledge" or "Based on the information I have".
                10. Do NOT include the phrases like "I am an AI model" or "I am a chatbot" in your response.
                11. Generate a response that is friendly, informative, and helpful to the student.
                12. Generate responses in a clear point-wise format for better readability.
                
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