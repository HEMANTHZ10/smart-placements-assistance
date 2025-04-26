from fastapi import APIRouter, Query, HTTPException, Depends
from typing import List
from models.chatbot_model import ChatbotModel
from services.company_insights_service import (
    getAllCompanyInsights, addCompanyInsightsData, addCompanyInsights, deleteCompanyInsightsData,deleteAllCompanyInsightsData
)
from utils.auth_utils import verify_token

router = APIRouter()    

# Company Insights Controllers

# Get Company Insights/Chatbot Data
@router.get("/get-company-insights-data")
async def get_company_insights_data(company_name: str = Query(None)):
    filters = {"company_name": company_name} if company_name else {}
    try:
        data = await getAllCompanyInsights(filters)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")

# Add Company Insights/Chatbot Record
@router.post("/add-company-insights-data")
async def add_company_insights_data(data: ChatbotModel,token: None=Depends(verify_token)):
    try:
        res = await addCompanyInsightsData(data)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding data: {str(e)}")
    
# Add bulk Company Insights/Chatbot Data at a time
@router.post("/add-all-company-insights-data")
async def add_all_company_insights_data(data_list: List[ChatbotModel],token: None=Depends(verify_token)):
    try:
        res = await addCompanyInsights(data_list)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding all data: {str(e)}")

# Delete a Company Insights/Chatbot Record (including filters)
@router.delete("/delete-company-insights-record")
async def delete_company_insights_record(
    entry_id: str = Query(None),
    company_name: str = Query(None),token: None=Depends(verify_token)
):
    filters = {key: value for key, value in {"entry_id": entry_id, "company_name": company_name}.items() if value is not None}
    if not filters:
        raise HTTPException(status_code=400, detail="At least one filter (entry_id or company_name) must be provided.")
    try:
        res = await deleteCompanyInsightsData(filters)
        if "error" in res:
            raise HTTPException(status_code=404, detail=res["error"])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting data: {str(e)}")

# Delete all Company Insights/Chatbot Data at a time
@router.delete("/delete-all-company-insights-data")
async def delete_all_company_insights_data(token: None=Depends(verify_token)):
    try:
        res = await deleteAllCompanyInsightsData()
        if "error" in res:
            raise HTTPException(status_code=404, detail=res["error"])
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting all data: {str(e)}")