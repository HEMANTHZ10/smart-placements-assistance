import asyncio,uuid
from collections import defaultdict
from database import company_insights_collection
from models.chatbot_model import ChatbotModel

from utils.embedding_model import get_embedding_model

# Company Insights Services

# Add a Single Company Insights/Chatbot Record
async def addCompanyInsightsData(data: ChatbotModel):
    # Loading a Sentence Transformer (Light-weight model for efficiency)
    model = get_embedding_model()
    for role in data.roles:
        roleData=(
            f"{data.description}\n"
            f"Company Name: {data.companyName}\n"
            f"Company Description: {data.companyDesc}\n"
            f"Role: {role.role}\n"
            f"Job Description: {role.jobDesc}\n"
            f"Package: {role.package}\n"
            f"Hiring Process:\n"+"\n".join([f"Round {k}: {v}" for k, v in role.rounds.items()])
        )
        embeddings = model.encode(roleData).tolist()
        metadata={
            "company_name": data.companyName,
            "company_desc": data.companyDesc,
            "roles": role.role,
            "job_desc": role.jobDesc,
            "package": role.package,
            "rounds": ", ".join([f"Round {k}: {v}" for k, v in role.rounds.items()])
        }
        await asyncio.to_thread(
            company_insights_collection.add,
            embeddings=[embeddings],
            documents=[roleData],
            metadatas=[metadata],
            ids=[str(uuid.uuid4())]
        )
    return {"message": "Data added successfully!"}

# Add bulk Company Insights/Chatbot Data at a time
async def addCompanyInsights(data_list: list[ChatbotModel]):
    if not data_list:
        return{"error":"No data provided!"}
    insertedIds = []
    model = get_embedding_model()
    for company in data_list:
        for role in company.roles:
            roleData=(
                f"{company.description}\n"
                f"Company Name: {company.companyName}\n"
                f"Company Description: {company.companyDesc}\n"
                f"Role: {role.role}\n"
                f"Job Description: {role.jobDesc}\n"
                f"Package: {role.package}\n"
                f"Hiring Process:\n"+"\n".join([f"Round {k}: {v}" for k, v in role.rounds.items()])
            )
            embeddings = model.encode(roleData).tolist()
            metadata={
                "company_name": company.companyName,
                "company_desc": company.companyDesc,
                "roles": role.role,
                "job_desc": role.jobDesc,
                "package": role.package,
                "rounds": ", ".join([f"Round {k}: {v}" for k, v in role.rounds.items()])
            }
            await asyncio.to_thread(
                company_insights_collection.add,
                embeddings=[embeddings],
                documents=[roleData],
                metadatas=[metadata],
                ids=[str(uuid.uuid4())]
            )
            insertedIds.append(str(uuid.uuid4()))
    return {"message": "All data added successfully!", "ids": insertedIds}

# Get Company Insights/Chatbot Data (including any filters)
async def getAllCompanyInsights(filters: dict):
    results = company_insights_collection.get(include=["metadatas"])
    if not results or not results.get("metadatas"):
        return {"message": "No data found."}
    company_map = defaultdict(lambda: {
        "companyName": "",
        "companyDesc": "",
        "roles": []
    })
    for metadata in results["metadatas"]:
        curr_company = metadata.get("company_name")
        if filters and "company_name" in filters:
            if curr_company.lower() != filters["company_name"].lower():
                continue
        company_desc = metadata.get("company_desc")
        role_name = metadata.get("roles")
        job_desc = metadata.get("job_desc")
        package = metadata.get("package")
        rounds_str = metadata.get("rounds", "")
        rounds_dict = {}
        for round_str in rounds_str.split(", "):
            if round_str.startswith("Round"):
                parts = round_str.split(": ", 1)
                if len(parts) == 2:
                    round_number = parts[0].split(" ")[1]
                    rounds_dict[round_number] = parts[1]
        role_obj = {
            "role": role_name,
            "jobDesc": job_desc,
            "package": package,
            "rounds": rounds_dict
        }
        company_map[curr_company]["companyName"] = curr_company
        company_map[curr_company]["companyDesc"] = company_desc
        company_map[curr_company]["roles"].append(role_obj)
    result = list(company_map.values())
    if filters and "company_name" in filters:
        return result[0] if result else {"message": "Company not found."}
    return result

# Delete a Company Insights/Chatbot Record (including filters)
async def deleteCompanyInsightsData(filters: dict):
    if not filters:
        return {"error": "No filters provided!"}
    entry_id=filters.get("entry_id")
    if entry_id:
        storedData = await asyncio.to_thread(
            company_insights_collection.get,
            ids=[entry_id]
        )
        if not storedData.get("ids"):
            return {"error": "No data found!"}
        await asyncio.to_thread(
            company_insights_collection.delete,
            ids=[entry_id]
        )
        return {"message": "Data deleted successfully!","id":entry_id}
    company_name=filters.get("company_name")
    if company_name:
        storedData = await asyncio.to_thread(
            company_insights_collection.get,
            where={"company_name": {"$eq": company_name}}
        )
        if not storedData.get("ids"):
            return {"error": "No data found!"}
        await asyncio.to_thread(
            company_insights_collection.delete,
            where={"company_name": {"$eq": company_name}}
        )
        return {"message": "Data deleted successfully!","company_name":company_name}

# Delete all Company Insights/Chatbot Records at a time
async def deleteAllCompanyInsightsData():
    storedData = await asyncio.to_thread(company_insights_collection.get)
    if not storedData.get("ids"):
        return {"error": "No data found!"}
    await asyncio.to_thread(company_insights_collection.delete, where={"company_name": {"$gte": 0}})
    return {"message": "All data deleted successfully!"}


