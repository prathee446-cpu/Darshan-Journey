from fastapi import APIRouter, Query
from app.database import get_collection
from typing import List, Optional

router = APIRouter(prefix="/api/products", tags=["Products & Services"])

DEFAULT_CATEGORIES = [
    {
        "id": "pooja-services",
        "title": "Pooja & Rituals",
        "domain": "Vedic Archana & Abhishekam",
        "description": "Authentic temple rituals performed by certified priests with sacred offerings.",
        "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "prashad-delivery",
        "title": "Sacred Prashad",
        "domain": "Doorstep Divine Blessings",
        "description": "Freshly prepared temple mahaprasadam delivered directly from holy sanctums.",
        "image": "https://images.unsplash.com/photo-1609946782701-790100780287?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "aarti-vip-pass",
        "title": "Aarti & Darshan Pass",
        "domain": "Priority Temple Access",
        "description": "Skip lines with hassle-free VIP priority access for morning and evening Aarti.",
        "image": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80"
    }
]

DEFAULT_PRODUCTS = [
    {
        "id": "prod-101",
        "title": "Maha Rudrabhishekam Seva",
        "price": "₹1,008",
        "category": "pooja-services",
        "description": "Sacred water and milk abhishekam offered directly to sanctum deity with Vedic mantras.",
        "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
        "rating": 4.9
    },
    {
        "id": "prod-102",
        "title": "Special Archana & Flower Basket",
        "price": "₹501",
        "category": "pooja-services",
        "description": "Personalized 108 Ashtothara archana with fresh lotus garlands.",
        "image": "https://images.unsplash.com/photo-1609946782701-790100780287?auto=format&fit=crop&w=800&q=80",
        "rating": 4.8
    },
    {
        "id": "prod-103",
        "title": "Doorstep Temple Laddu Prashad Box",
        "price": "₹350",
        "category": "prashad-delivery",
        "description": "Authentic temple ghee laddus & kumkum prasadam delivered to your doorstep.",
        "image": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
        "rating": 4.95
    }
]

@router.get("/categories", response_model=List[dict])
def get_product_categories():
    products_col = get_collection("categories")
    docs = list(products_col.find({}, {"_id": 0}))
    if not docs:
        return DEFAULT_CATEGORIES
    return docs

@router.get("", response_model=List[dict])
def get_products(category: Optional[str] = Query(None)):
    products_col = get_collection("products")
    query_filter = {}
    if category:
        query_filter["category"] = category
        
    raw_docs = products_col.find(query_filter)
    docs = [d for d in raw_docs]
    if not docs:
        if category:
            filtered = [p for p in DEFAULT_PRODUCTS if p.get("category") == category]
            return filtered if filtered else DEFAULT_PRODUCTS
        return DEFAULT_PRODUCTS
    return docs
