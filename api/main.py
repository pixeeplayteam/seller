from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from supabase import create_client, Client

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client
supabase: Client = create_client(
    os.getenv("VITE_SUPABASE_URL"),
    os.getenv("VITE_SUPABASE_ANON_KEY")
)

class Product(BaseModel):
    title: str
    description: str
    ean_code: str
    asin: Optional[str] = None
    price: float
    dimensions: dict
    weight: dict
    images: Optional[List[str]] = None
    status: str
    browse_nodes: Optional[List[str]] = None
    sales_rank: Optional[int] = None
    buy_box: Optional[dict] = None
    amazon_price: Optional[float] = None
    lowest_prices: Optional[dict] = None
    list_price: Optional[float] = None
    product_group: Optional[str] = None
    product_type: Optional[str] = None

@app.get("/api/products")
async def get_products():
    try:
        response = supabase.table("products").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/products")
async def create_product(product: Product):
    try:
        response = supabase.table("products").insert(product.dict()).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/products/{product_id}")
async def update_product(product_id: str, product: Product):
    try:
        response = supabase.table("products").update(product.dict()).eq("id", product_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str):
    try:
        response = supabase.table("products").delete().eq("id", product_id).execute()
        return {"message": "Product deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))