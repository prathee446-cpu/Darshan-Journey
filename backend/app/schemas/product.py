from pydantic import BaseModel
from typing import Optional, List, Any

class ProductItem(BaseModel):
    id: str
    title: str
    price: str
    category: str
    description: Optional[str] = ""
    image: Optional[str] = None
    rating: Optional[float] = 4.9

class CategoryItem(BaseModel):
    id: str
    title: str
    domain: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
