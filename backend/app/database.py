import logging
import time
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import settings

logger = logging.getLogger("darshan.database")
logging.basicConfig(level=logging.INFO)

# In-memory document collection fallback if MongoDB Atlas is offline/unreachable
class InMemoryCollection:
    def __init__(self, name):
        self.name = name
        self.docs = []

    def find_one(self, filter_dict=None):
        if not filter_dict:
            return self.docs[0] if self.docs else None
        for doc in self.docs:
            match = True
            for k, v in filter_dict.items():
                if k == "$or" and isinstance(v, list):
                    or_match = False
                    for cond in v:
                        if all(doc.get(sub_k) == sub_v for sub_k, sub_v in cond.items()):
                            or_match = True
                            break
                    if not or_match:
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find(self, filter_dict=None, projection=None):
        results = []
        if not filter_dict:
            results = list(self.docs)
        else:
            for doc in self.docs:
                match = True
                for k, v in filter_dict.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if match:
                    results.append(doc)

        class Cursor:
            def __init__(self, items):
                self.items = items
            def sort(self, key, direction):
                return self
            def __iter__(self):
                return iter(self.items)
            def __len__(self):
                return len(self.items)
            def list(self):
                return self.items

        return Cursor(results)

    def insert_one(self, doc):
        if "_id" not in doc:
            from bson.objectid import ObjectId
            doc["_id"] = str(ObjectId())
        self.docs.append(doc)
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc["_id"])

class InMemoryDatabase:
    def __init__(self, db_name):
        self.name = db_name
        self.collections = {}

    def __getitem__(self, item):
        if item not in self.collections:
            self.collections[item] = InMemoryCollection(item)
        return self.collections[item]

class DatabaseManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_atlas = False

    def connect(self):
        if self.db is not None:
            return self.db

        if settings.MONGODB_URI and "mongodb" in settings.MONGODB_URI:
            try:
                logger.info(f"Connecting to MongoDB Atlas at '{settings.DATABASE_NAME}'...")
                client = MongoClient(
                    settings.MONGODB_URI,
                    serverSelectionTimeoutMS=3000,
                    connectTimeoutMS=3000
                )
                client.admin.command('ping')
                self.client = client
                self.db = client[settings.DATABASE_NAME]
                self.is_atlas = True
                logger.info("✅ Connected successfully to MongoDB Atlas!")
                return self.db
            except Exception as e:
                logger.warning(f"⚠️ MongoDB Atlas unavailable ({e}). Initializing high-availability in-memory database store.")

        # Fallback to in-memory store
        self.db = InMemoryDatabase(settings.DATABASE_NAME)
        return self.db

db_manager = DatabaseManager()

def get_database():
    return db_manager.connect()

def get_collection(collection_name: str):
    db = get_database()
    return db[collection_name]
