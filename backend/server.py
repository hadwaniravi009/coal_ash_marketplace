import io
import logging
import os
import shutil
import uuid
import zipfile
from datetime import datetime, timedelta, timezone
from enum import Enum
from pathlib import Path
from typing import List, Optional

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import ExpiredSignatureError, InvalidTokenError
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGODB_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DATABASE_NAME', 'coal_ash_marketplace')]

# JWT Configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Create the main app without a prefix
app = FastAPI(title="Coal Ash Marketplace", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Enums
class UserRole(str, Enum):
    SUPPLIER = "supplier"
    BUYER = "buyer"
    LOGISTICS = "logistics"
    ADMIN = "admin"

class CoalAshType(str, Enum):
    FLY_ASH = "fly_ash"
    BOTTOM_ASH = "bottom_ash"
    POND_ASH = "pond_ash"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    company: str
    contact_person: str
    phone: str
    role: UserRole
    address: str
    city: str
    state: str
    kyc_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    company: str
    contact_person: str
    phone: str
    role: UserRole
    address: str
    city: str
    state: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class CoalAshProduct(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    supplier_id: str
    title: str
    ash_type: CoalAshType
    quantity_available: int  # in tons
    price_per_ton: float
    location: str
    city: str
    state: str
    quality_specs: dict
    test_report_url: Optional[str] = None
    description: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    title: str
    ash_type: CoalAshType
    quantity_available: int
    price_per_ton: float
    location: str
    city: str
    state: str
    quality_specs: dict
    test_report_url: Optional[str] = None
    description: str

class DemandRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    buyer_id: str
    title: str
    ash_type: CoalAshType
    quantity_required: int
    max_price_per_ton: float
    delivery_location: str
    delivery_city: str
    delivery_state: str
    required_by: datetime
    quality_requirements: dict
    description: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DemandCreate(BaseModel):
    title: str
    ash_type: CoalAshType
    quantity_required: int
    max_price_per_ton: float
    delivery_location: str
    delivery_city: str
    delivery_state: str
    required_by: datetime
    quality_requirements: dict
    description: str

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    buyer_id: str
    supplier_id: str
    product_id: str
    demand_id: Optional[str] = None
    quantity: int
    agreed_price_per_ton: float
    total_amount: float
    delivery_address: str
    status: OrderStatus = OrderStatus.PENDING
    contract_terms: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    product_id: str
    quantity: int
    delivery_address: str
    contract_terms: Optional[str] = None

# Utility Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return User(**user)

# Authentication Endpoints
@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = hash_password(user_data.password)
    user_dict = user_data.dict()
    user_dict.pop("password")
    
    user = User(**user_dict)
    user_doc = user.dict()
    user_doc["password_hash"] = hashed_password
    
    await db.users.insert_one(user_doc)
    return user

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    access_token = create_access_token(data={"sub": user["id"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(**user)
    }

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Product Endpoints
@api_router.post("/products", response_model=CoalAshProduct)
async def create_product(product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.SUPPLIER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only suppliers can create products"
        )
    
    product_dict = product_data.dict()
    product_dict["supplier_id"] = current_user.id
    product = CoalAshProduct(**product_dict)
    await db.products.insert_one(product.dict())
    return product

@api_router.get("/products", response_model=List[CoalAshProduct])
async def get_products(
    ash_type: Optional[CoalAshType] = None,
    city: Optional[str] = None,
    min_quantity: Optional[int] = None,
    max_price: Optional[float] = None
):
    filter_query: dict = {"is_active": True}
    
    if ash_type:
        filter_query["ash_type"] = ash_type.value
    if city:
        filter_query["city"] = {"$regex": city, "$options": "i"}
    if min_quantity:
        filter_query["quantity_available"] = {"$gte": min_quantity}
    if max_price:
        filter_query["price_per_ton"] = {"$lte": max_price}
    
    products = await db.products.find(filter_query).to_list(1000)
    return [CoalAshProduct(**product) for product in products]

@api_router.get("/products/my", response_model=List[CoalAshProduct])
async def get_my_products(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.SUPPLIER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only suppliers can view their products"
        )
    
    products = await db.products.find({"supplier_id": current_user.id}).to_list(1000)
    return [CoalAshProduct(**product) for product in products]

# Demand Endpoints
@api_router.post("/demands", response_model=DemandRequest)
async def create_demand(demand_data: DemandCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.BUYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can create demand requests"
        )
    
    demand_dict = demand_data.dict()
    demand_dict["buyer_id"] = current_user.id
    demand = DemandRequest(**demand_dict)
    await db.demands.insert_one(demand.dict())
    return demand

@api_router.get("/demands", response_model=List[DemandRequest])
async def get_demands():
    demands = await db.demands.find({"is_active": True}).to_list(1000)
    return [DemandRequest(**demand) for demand in demands]

@api_router.get("/demands/my", response_model=List[DemandRequest])
async def get_my_demands(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.BUYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can view their demands"
        )
    
    demands = await db.demands.find({"buyer_id": current_user.id}).to_list(1000)
    return [DemandRequest(**demand) for demand in demands]

# Order Endpoints
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.BUYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can create orders"
        )
    
    # Get product details
    product = await db.products.find_one({"id": order_data.product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if product["quantity_available"] < order_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient quantity available"
        )
    
    # Create order
    order_dict = order_data.dict()
    order_dict["buyer_id"] = current_user.id
    order_dict["supplier_id"] = product["supplier_id"]
    order_dict["agreed_price_per_ton"] = product["price_per_ton"]
    order_dict["total_amount"] = product["price_per_ton"] * order_data.quantity
    
    order = Order(**order_dict)
    await db.orders.insert_one(order.dict())
    
    # Update product quantity
    await db.products.update_one(
        {"id": order_data.product_id},
        {"$inc": {"quantity_available": -order_data.quantity}}
    )
    
    return order

@api_router.get("/orders/my", response_model=List[Order])
async def get_my_orders(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.BUYER:
        orders = await db.orders.find({"buyer_id": current_user.id}).to_list(1000)
    elif current_user.role == UserRole.SUPPLIER:
        orders = await db.orders.find({"supplier_id": current_user.id}).to_list(1000)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return [Order(**order) for order in orders]

# Analytics Endpoints
@api_router.get("/analytics/dashboard")
async def get_dashboard_analytics(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.ADMIN:
        # Admin dashboard
        total_users = await db.users.count_documents({})
        total_products = await db.products.count_documents({"is_active": True})
        total_orders = await db.orders.count_documents({})
        total_demands = await db.demands.count_documents({"is_active": True})
        
        recent_orders_raw = await db.orders.find().sort("created_at", -1).limit(5).to_list(5)
        recent_orders = [Order(**order) for order in recent_orders_raw]
        
        return {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_demands": total_demands,
            "recent_orders": recent_orders
        }
    
    elif current_user.role == UserRole.SUPPLIER:
        # Supplier dashboard
        my_products = await db.products.count_documents({"supplier_id": current_user.id})
        my_orders = await db.orders.count_documents({"supplier_id": current_user.id})
        total_revenue = await db.orders.aggregate([
            {"$match": {"supplier_id": current_user.id}},
            {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
        ]).to_list(1)
        
        recent_orders_raw = await db.orders.find({"supplier_id": current_user.id}).sort("created_at", -1).limit(5).to_list(5)
        recent_orders = [Order(**order) for order in recent_orders_raw]
        
        return {
            "my_products": my_products,
            "my_orders": my_orders,
            "total_revenue": total_revenue[0]["total"] if total_revenue else 0,
            "recent_orders": recent_orders
        }
    
    elif current_user.role == UserRole.BUYER:
        # Buyer dashboard
        my_demands = await db.demands.count_documents({"buyer_id": current_user.id})
        my_orders = await db.orders.count_documents({"buyer_id": current_user.id})
        total_spent = await db.orders.aggregate([
            {"$match": {"buyer_id": current_user.id}},
            {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
        ]).to_list(1)
        
        recent_orders_raw = await db.orders.find({"buyer_id": current_user.id}).sort("created_at", -1).limit(5).to_list(5)
        recent_orders = [Order(**order) for order in recent_orders_raw]
        
        return {
            "my_demands": my_demands,
            "my_orders": my_orders,
            "total_spent": total_spent[0]["total"] if total_spent else 0,
            "recent_orders": recent_orders
        }

# Supply-Demand Matching
@api_router.get("/matching/suggestions")
async def get_matching_suggestions(current_user: User = Depends(get_current_user)):
    suggestions = []
    
    if current_user.role == UserRole.BUYER:
        # Find matching products for buyer's demands
        demands = await db.demands.find({"buyer_id": current_user.id, "is_active": True}).to_list(1000)
        
        for demand in demands:
            matching_products = await db.products.find({
                "ash_type": demand["ash_type"],
                "quantity_available": {"$gte": demand["quantity_required"]},
                "price_per_ton": {"$lte": demand["max_price_per_ton"]},
                "is_active": True
            }).to_list(10)
            
            if matching_products:
                suggestions.append({
                    "demand": DemandRequest(**demand),
                    "matching_products": [CoalAshProduct(**p) for p in matching_products]
                })
    
    elif current_user.role == UserRole.SUPPLIER:
        # Find matching demands for supplier's products
        products = await db.products.find({"supplier_id": current_user.id, "is_active": True}).to_list(1000)
        
        for product in products:
            matching_demands = await db.demands.find({
                "ash_type": product["ash_type"],
                "quantity_required": {"$lte": product["quantity_available"]},
                "max_price_per_ton": {"$gte": product["price_per_ton"]},
                "is_active": True
            }).to_list(10)
            
            if matching_demands:
                suggestions.append({
                    "product": CoalAshProduct(**product),
                    "matching_demands": [DemandRequest(**d) for d in matching_demands]
                })
    
    return {"suggestions": suggestions}

# Download Project ZIP
@api_router.get("/download/project")
async def download_project_zip(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can download project files"
        )
    
    # Create a ZIP file in memory
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add backend files
        backend_path = Path(__file__).parent
        for root, dirs, files in os.walk(backend_path):
            # Skip certain directories
            dirs[:] = [d for d in dirs if d not in ['__pycache__', '.git', 'node_modules']]
            
            for file in files:
                if not file.endswith(('.pyc', '.pyo', '.log')):
                    file_path = Path(root) / file
                    arcname = str(file_path.relative_to(backend_path.parent))
                    zip_file.write(file_path, arcname)
        
        # Add frontend files
        frontend_path = backend_path.parent / 'frontend'
        if frontend_path.exists():
            for root, dirs, files in os.walk(frontend_path):
                # Skip certain directories
                dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'build']]
                
                for file in files:
                    file_path = Path(root) / file
                    arcname = str(file_path.relative_to(backend_path.parent))
                    zip_file.write(file_path, arcname)
    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        io.BytesIO(zip_buffer.read()),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=coal-ash-marketplace.zip"}
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()