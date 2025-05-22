import asyncio
from models.chatbot_model import ChatbotModel
from database import company_insights_collection, company_stats_collection

from utils.embedding_model import get_embedding_model
from utils.cache import get_cached_response, set_cached_response
from utils.llm import query_ollama
from utils.nlp import extract_entities

# Greeting response map
GREETING_RESPONSES = {
    "hello": "Hello! 👋 How can I help you with placement-related queries today?",
    "hi": "Hi there! 😊 I'm here to assist with any recruitment or company-related info.",
    "hey": "Hey! 👋 Ask me about company stats, offers, or placement trends.",
    "good morning": "Good morning! 🌞 What placement info can I help you with today?",
    "good afternoon": "Good afternoon! 🌤️ Let me know your placement or company-related query.",
    "good evening": "Good evening! 🌙 Feel free to ask about placement records or hiring stats.",
    "how are you": "I'm great, thanks for asking! 😊 What placement info can I fetch for you?",
    "how's it going": "All good here! 🚀 Let me know how I can help with placement insights.",
    "who are you": "I'm your Placements Assistant 🤖 here to help you understand company recruitment trends.",
    "what's up": "Not much! Just helping students with placement queries. What can I do for you?",
    "greetings": "Greetings! ✨ I'm here to support you with your placement-related questions."
}

# Keyword list to detect placement-relevant queries
PLACEMENT_KEYWORDS = [
    "placement", "recruitment", "company", "drive", "job", "offer", "internship",
    "ppo", "package", "ctc", "stipend", "hiring", "selection", "shortlist",
    "round", "interview", "aptitude", "coding", "technical", "hr", "profile",
    "domain", "location", "role", "experience", "vacancy", "opportunity",
    "campus", "off-campus", "on-campus", "hike", "promotion", "designation",
    "panel", "resume", "cv", "test", "assessment", "criteria", "eligibility",
    "batch", "freshers", "referred", "walk-in", "openings", "interviews",
    "interviewed", "recruited", "exam", "assessment", "interview process",
    "interview pattern", "interview experience", "joining", "bond", "agreement",
    "notice period", "conversion", "full-time", "intern to full-time",
    "offer letter", "joining date", "company insights", "placement stats",
    "placement statistics", "students placed", "placement record", "average package",
    "highest package", "placement report", "selection process"
]

# Fallback friendly message for irrelevant queries
IRRELEVANT_RESPONSE = (
    "I'm here to assist with placement and company-related queries only. 😊 "
    "Feel free to ask me about companies, roles, offers, internships, or hiring stats!"
)

# Detect if it's a greeting
def get_greeting_response(query: str) -> str | None:
    lower_query = query.strip().lower()
    for greet, response in GREETING_RESPONSES.items():
        if greet in lower_query:
            return response
    return None

# Detect if the query is irrelevant to placements
def is_irrelevant_query(query: str) -> bool:
    lower_query = query.lower()
    if any(keyword in lower_query for keyword in PLACEMENT_KEYWORDS):
        return False
    entities = extract_entities(query)
    for text, label in entities:
        if label == "ORG" or (label == "DATE" and text.isdigit()):
            return False
    return True

# Main function
async def get_chatbot_answer(query: str):
    # 1. Handle Greetings
    greeting_response = get_greeting_response(query)
    if greeting_response:
        return {"answer": greeting_response, "source": "rule-based"}

    # 2. Handle Irrelevant Queries
    if is_irrelevant_query(query):
        return {"answer": IRRELEVANT_RESPONSE, "source": "rule-based"}

    # 3. Check Cache
    cached_response = get_cached_response(query)
    if cached_response:
        return {"answer": cached_response["answer"], "source": "cache"}

    # 4. Extract Entities
    entities = extract_entities(query)
    company = None
    year = None

    for text, label in entities:
        if label == "ORG":
            company = text
        elif label == "DATE" and text.isdigit():
            year = text

    # 5. Query ChromaDB
    model = get_embedding_model()
    query_embedding = model.encode(query).tolist()

    results = await asyncio.to_thread(
        company_insights_collection.query,
        query_embeddings=[query_embedding],
        n_results=5,
    )
    chroma_context = "\n\n".join(results["documents"][0])

    # 6. Additional Stats Context
    stats_context = ""
    try:
        filters = {}
        if company:
            filters["company_name"] = company.upper()
        if year:
            filters["year"] = int(year)

        if filters:
            if len(filters) == 1:
                key, value = next(iter(filters.items()))
                conditions = {key: {"$eq": value}}
            else:
                conditions = {"$and": [{key: {"$eq": value}} for key, value in filters.items()]}
        else:
            conditions = {}

        stats_data = await asyncio.to_thread(
            lambda: company_stats_collection.get(where=conditions) if filters else company_stats_collection.get()
        )
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
        print(f"[WARN] Failed to fetch stats context: {e}")

    # 7. Final Prompt
    combined_context = "\n\n".join(filter(None, [chroma_context, stats_context]))

    prompt = f"""
                You are an AI-powered Placements Assistance Chatbot designed to help college students understand company-specific hiring information based on provided data.

                Your role:
                - Act as a knowledgeable assistant for student placement-related queries.
                - Answer only using the context provided.
                - Never fabricate or assume any data not present in the context.
                - Never hallucinate or generate responses by guessing or assuming, if enough context is not provided just reply with the fall back message.
                - Never answer/respond to a query by using your own general knowledge, always use the context provided.
                - If the query is not related to company stats or placement records, respond with a friendly greeting.
                - If the query is a greeting or small talk, respond with a friendly message.
                - You must refrain from responding to any query if the provided context and the user's query are not clearly associated or related. Responses should only be generated when there is a direct and meaningful connection between the context and the query to ensure relevance and accuracy.

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

    # 8. LLM Response
    answer = await asyncio.to_thread(query_ollama, prompt)
    response = {"answer": answer, "source": "llm"}

    # 9. Cache
    if answer and response["source"] == "llm" and "Sorry" not in answer:
        set_cached_response(query, response)

    return response
