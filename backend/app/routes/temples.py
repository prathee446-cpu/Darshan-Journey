from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.temple import TempleSearchQuery, TempleSearchResponse, TempleSearchResultItem
from app.services.web_search_service import search_temples_web
from app.database import get_collection
from typing import List, Optional

router = APIRouter(prefix="/api/temples", tags=["Temples"])

@router.post("/search-web", response_model=TempleSearchResponse)
async def search_temples_web_route(payload: TempleSearchQuery):
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Search query is required.")

    results = await search_temples_web(query)
    
    formatted_results = [
        TempleSearchResultItem(
            name=r.get("name") or query,
            location=r.get("location") or "Tamil Nadu, India",
            description=r.get("description") or "Sanctified temple shrine details.",
            source=r.get("source") or "Live Web Search",
            url=r.get("url"),
            coverImage=r.get("coverImage")
        ) for r in results
    ]

    return TempleSearchResponse(
        success=True,
        query=query,
        results=formatted_results
    )

@router.get("", response_model=List[dict])
def get_all_temples(category: Optional[str] = None):
    temples_col = get_collection("temples")
    query_filter = {}
    if category:
        query_filter["category"] = category
    
    docs = list(temples_col.find(query_filter, {"_id": 0}))
    return docs

@router.get("/{temple_id}", response_model=dict)
def get_temple_by_id(temple_id: str):
    temples_col = get_collection("temples")
    doc = temples_col.find_one({"$or": [{"id": temple_id}, {"slug": temple_id}]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Temple '{temple_id}' not found.")
    return doc
