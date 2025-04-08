from pydantic import BaseModel
from typing import Optional,List,Dict

class Role(BaseModel):
    role: str
    jobDesc: str
    package: str
    rounds: Dict[str, str]

class ChatbotModel(BaseModel):
    id: str
    companyName: str
    companyDesc: str
    roles: List[Role]
    description: str
