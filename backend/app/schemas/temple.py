from pydantic import BaseModel, Field
from typing import Optional, List

class TempleSearchQuery(BaseModel):
    query: str = Field(..., min_length=1, example="Meenakshi Amman")

class TempleSearchResultItem(BaseModel):
    name: str
    location: Optional[str] = "Tamil Nadu, India"
    description: Optional[str] = ""
    source: Optional[str] = "Live Web"
    url: Optional[str] = None
    coverImage: Optional[str] = None

class TempleSearchResponse(BaseModel):
    success: bool = True
    query: str
    results: List[TempleSearchResultItem]
