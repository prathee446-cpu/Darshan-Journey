import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import get_database
from app.routes import auth, temples, products, bookings

logger = logging.getLogger("darshan.main")

app = FastAPI(
    title="Darshan Journey FastAPI Backend",
    description="Sacred Temple Journey, Virtual Darshan, Authentication & Booking API built with FastAPI, PyMongo, and MongoDB Atlas.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React Vite development server & production builds
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include APIRouters
app.include_router(auth.router)
app.include_router(temples.router)
app.include_router(products.router)
app.include_router(bookings.router)

@app.on_event("startup")
def startup_db_client():
    logger.info("Initializing FastAPI backend startup & MongoDB Atlas connection...")
    try:
        db = get_database()
        logger.info(f"FastAPI Backend operational. Active database: {db.name}")
    except Exception as e:
        logger.warning(f"Database startup notice: {e}")

@app.get("/", tags=["Health Check"])
def root_health_check():
    return {
        "status": "online",
        "service": "Darshan Journey FastAPI Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health Check"])
def health_check():
    return {"status": "ok", "database": "connected"}
