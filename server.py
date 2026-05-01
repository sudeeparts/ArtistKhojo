"""
ArtistKhojo backend – FastAPI + Motor (MongoDB).
Mock OTP (123456) + JWT auth + Admin password login.
Uploads are base64 strings stored inline on documents.
"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from pathlib import Path
import os, uuid, logging, jwt, bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@artistkhojo.in")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@123")
MOCK_OTP = os.environ.get("MOCK_OTP", "123456")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="ArtistKhojo API")
api = APIRouter(prefix="/api")

logger = logging.getLogger("artistkhojo")
logging.basicConfig(level=logging.INFO)


# ---------- helpers ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


def create_token(payload: dict, days: int = 30) -> str:
    data = {**payload, "exp": datetime.now(timezone.utc) + timedelta(days=days)}
    return jwt.encode(data, JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {e}")


async def current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing bearer token")
    data = decode_token(authorization.split(" ", 1)[1])
    if data.get("role") == "admin":
        return {"id": "admin", "role": "admin", "email": ADMIN_EMAIL}
    user = await db.users.find_one({"id": data["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user


async def require_admin(user: dict = Depends(current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return user


# ---------- Schemas ----------
class OTPRequest(BaseModel):
    phone: str


class OTPVerify(BaseModel):
    phone: str
    otp: str


class RoleSet(BaseModel):
    role: str  # artist | customer


class UserUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    email: Optional[str] = None


class AdminLogin(BaseModel):
    email: str
    password: str


class PortfolioItem(BaseModel):
    type: str  # image | video
    data: str  # base64 data URL


class ArtistProfileIn(BaseModel):
    name: str
    bio: Optional[str] = ""
    category: str
    city: str
    instagram_followers: Optional[int] = 0
    instagram_link: Optional[str] = ""
    whatsapp: Optional[str] = ""
    email: Optional[str] = ""
    hourly_rate: Optional[int] = 0
    portfolio: List[PortfolioItem] = []
    aadhaar_file: Optional[str] = ""  # base64
    intro_video: Optional[str] = ""   # base64


class RequirementIn(BaseModel):
    category: str
    description: str
    budget: int
    date: str
    location: str
    reference_images: List[str] = []


class BookingIn(BaseModel):
    artist_id: str
    requirement_id: Optional[str] = None
    date: str
    amount: int
    notes: Optional[str] = ""


class ReviewIn(BaseModel):
    rating: int
    comment: str


class WalletAdd(BaseModel):
    amount: int
    razorpay_payment_id: Optional[str] = ""


class PayBooking(BaseModel):
    booking_id: str


# ---------- Seed ----------
@app.on_event("startup")
async def startup():
    await db.users.create_index("phone", unique=True)
    await db.artist_profiles.create_index("user_id", unique=True)
    logger.info("ArtistKhojo API ready. Admin: %s", ADMIN_EMAIL)


# ---------- AUTH ----------
@api.post("/auth/send-otp")
async def send_otp(body: OTPRequest):
    # Mock OTP — always 123456. In production, integrate Twilio here.
    return {"success": True, "message": f"OTP sent to {body.phone}", "dev_otp": MOCK_OTP}


@api.post("/auth/verify-otp")
async def verify_otp(body: OTPVerify):
    if body.otp != MOCK_OTP:
        raise HTTPException(400, "Invalid OTP")
    user = await db.users.find_one({"phone": body.phone}, {"_id": 0})
    if not user:
        user = {
            "id": new_id(),
            "phone": body.phone,
            "role": None,
            "name": "",
            "city": "",
            "email": "",
            "wallet_balance": 0,
            "created_at": now_iso(),
        }
        await db.users.insert_one({**user})
    token = create_token({"sub": user["id"], "role": user.get("role") or "none"})
    return {"token": token, "user": {k: v for k, v in user.items() if k != "_id"}}


@api.post("/auth/admin-login")
async def admin_login(body: AdminLogin):
    if body.email != ADMIN_EMAIL or body.password != ADMIN_PASSWORD:
        raise HTTPException(401, "Invalid admin credentials")
    token = create_token({"sub": "admin", "role": "admin"})
    return {"token": token, "user": {"id": "admin", "role": "admin", "email": ADMIN_EMAIL}}


@api.get("/auth/me")
async def me(user: dict = Depends(current_user)):
    if user.get("role") == "admin":
        return {"user": user, "profile": None}
    profile = await db.artist_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    return {"user": user, "profile": profile}


# ---------- USERS ----------
@api.put("/users/me")
async def update_me(body: UserUpdate, user: dict = Depends(current_user)):
    if user.get("role") == "admin":
        raise HTTPException(403, "Admins have no profile")
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if upd:
        await db.users.update_one({"id": user["id"]}, {"$set": upd})
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return u


@api.post("/users/set-role")
async def set_role(body: RoleSet, user: dict = Depends(current_user)):
    if body.role not in ("artist", "customer"):
        raise HTTPException(400, "Invalid role")
    await db.users.update_one({"id": user["id"]}, {"$set": {"role": body.role}})
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    token = create_token({"sub": u["id"], "role": u["role"]})
    return {"user": u, "token": token}


# ---------- ARTIST PROFILES ----------
def _public_artist(a: dict, reviews_count: int = 0, avg_rating: float = 0.0, completed: int = 0) -> dict:
    """Strip private contact info for public view."""
    return {
        "id": a["id"],
        "user_id": a["user_id"],
        "name": a["name"],
        "bio": a.get("bio", ""),
        "category": a["category"],
        "city": a["city"],
        "instagram_followers": a.get("instagram_followers", 0),
        "hourly_rate": a.get("hourly_rate", 0),
        "portfolio": a.get("portfolio", []),
        "verified": a.get("verified", False),
        "rating": round(avg_rating, 1),
        "reviews_count": reviews_count,
        "completed_works": completed,
        "avatar": a.get("avatar", ""),
        "created_at": a.get("created_at"),
    }


async def _enrich(artist: dict) -> dict:
    reviews = await db.reviews.find({"artist_id": artist["id"]}, {"_id": 0}).to_list(1000)
    avg = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0.0
    completed = await db.bookings.count_documents({"artist_id": artist["id"], "status": "completed"})
    return _public_artist(artist, len(reviews), avg, completed)


@api.post("/artists")
async def upsert_artist(body: ArtistProfileIn, user: dict = Depends(current_user)):
    if user.get("role") != "artist":
        raise HTTPException(403, "Only artists can create a profile")
    existing = await db.artist_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    data = body.model_dump()
    # Recompute verification flag from current aadhaar + intro video presence
    data["verification_submitted"] = bool(data.get("aadhaar_file") and data.get("intro_video"))
    if existing:
        await db.artist_profiles.update_one({"user_id": user["id"]}, {"$set": data})
        a = await db.artist_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    else:
        doc = {
            "id": new_id(),
            "user_id": user["id"],
            "verified": False,
            "verification_submitted": bool(data.get("aadhaar_file") and data.get("intro_video")),
            "created_at": now_iso(),
            **data,
        }
        await db.artist_profiles.insert_one({**doc})
        a = {k: v for k, v in doc.items() if k != "_id"}
    return a


@api.get("/artists")
async def list_artists(
    category: Optional[str] = None,
    city: Optional[str] = None,
    min_rating: float = 0,
    min_followers: int = 0,
    verified_only: bool = False,
    q: Optional[str] = None,
    limit: int = 60,
):
    query: dict = {}
    if category and category != "all":
        query["category"] = category
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if min_followers:
        query["instagram_followers"] = {"$gte": min_followers}
    if verified_only:
        query["verified"] = True
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"bio": {"$regex": q, "$options": "i"}},
            {"category": {"$regex": q, "$options": "i"}},
        ]
    artists = await db.artist_profiles.find(query, {"_id": 0}).to_list(limit)
    enriched = [await _enrich(a) for a in artists]
    if min_rating:
        enriched = [e for e in enriched if e["rating"] >= min_rating]
    return enriched


@api.get("/artists/featured")
async def featured():
    artists = await db.artist_profiles.find({"verified": True}, {"_id": 0}).limit(12).to_list(12)
    if len(artists) < 6:
        more = await db.artist_profiles.find({}, {"_id": 0}).limit(12).to_list(12)
        seen = {a["id"] for a in artists}
        for m in more:
            if m["id"] not in seen:
                artists.append(m)
    return [await _enrich(a) for a in artists[:12]]


@api.get("/artists/{artist_id}")
async def get_artist(artist_id: str):
    a = await db.artist_profiles.find_one({"id": artist_id}, {"_id": 0})
    if not a:
        raise HTTPException(404, "Artist not found")
    enriched = await _enrich(a)
    reviews = await db.reviews.find({"artist_id": artist_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    enriched["reviews"] = reviews
    return enriched


@api.get("/artists/me/private")
async def my_artist_private(user: dict = Depends(current_user)):
    """Artist's own view — includes private contact info."""
    if user.get("role") != "artist":
        raise HTTPException(403, "Artists only")
    a = await db.artist_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not a:
        return None
    return a


# ---------- REQUIREMENTS ----------
@api.post("/requirements")
async def create_requirement(body: RequirementIn, user: dict = Depends(current_user)):
    if user.get("role") != "customer":
        raise HTTPException(403, "Customers only")
    doc = {
        "id": new_id(),
        "customer_id": user["id"],
        "customer_name": user.get("name", "Customer"),
        "status": "open",
        "created_at": now_iso(),
        **body.model_dump(),
    }
    await db.requirements.insert_one({**doc})
    return {k: v for k, v in doc.items() if k != "_id"}


@api.get("/requirements")
async def list_requirements(user: dict = Depends(current_user)):
    """Artists see all open, customers see their own."""
    if user.get("role") == "customer":
        reqs = await db.requirements.find({"customer_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    else:
        # artist: filter by their category if profile exists
        profile = await db.artist_profiles.find_one({"user_id": user["id"]}, {"_id": 0}) if user.get("role") == "artist" else None
        query = {"status": "open"}
        if profile:
            query["category"] = profile["category"]
        reqs = await db.requirements.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return reqs


# ---------- BOOKINGS ----------
@api.post("/bookings")
async def create_booking(body: BookingIn, user: dict = Depends(current_user)):
    if user.get("role") != "customer":
        raise HTTPException(403, "Customers only")
    artist = await db.artist_profiles.find_one({"id": body.artist_id}, {"_id": 0})
    if not artist:
        raise HTTPException(404, "Artist not found")
    doc = {
        "id": new_id(),
        "customer_id": user["id"],
        "customer_name": user.get("name", "Customer"),
        "artist_id": artist["id"],
        "artist_user_id": artist["user_id"],
        "artist_name": artist["name"],
        "status": "pending_payment",  # pending_payment -> confirmed -> completed | cancelled
        "created_at": now_iso(),
        **body.model_dump(),
    }
    await db.bookings.insert_one({**doc})
    return {k: v for k, v in doc.items() if k != "_id"}


@api.get("/bookings/mine")
async def my_bookings(user: dict = Depends(current_user)):
    if user.get("role") == "customer":
        bookings = await db.bookings.find({"customer_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    elif user.get("role") == "artist":
        bookings = await db.bookings.find({"artist_user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    else:
        bookings = []
    return bookings


@api.patch("/bookings/{booking_id}/status")
async def update_status(booking_id: str, status: str, user: dict = Depends(current_user)):
    allowed = {"confirmed", "completed", "cancelled"}
    if status not in allowed:
        raise HTTPException(400, "Invalid status")
    b = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not b:
        raise HTTPException(404, "Booking not found")
    if user["id"] not in (b["customer_id"], b["artist_user_id"]) and user.get("role") != "admin":
        raise HTTPException(403, "Not allowed")
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status, "updated_at": now_iso()}})
    return {"success": True, "status": status}


@api.post("/bookings/{booking_id}/pay")
async def pay_booking(booking_id: str, user: dict = Depends(current_user)):
    """Mock Razorpay — deducts from wallet or simulates success."""
    b = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not b or b["customer_id"] != user["id"]:
        raise HTTPException(404, "Booking not found")
    if b["status"] != "pending_payment":
        raise HTTPException(400, "Already paid or invalid state")
    # use wallet
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    if u["wallet_balance"] < b["amount"]:
        raise HTTPException(400, "Insufficient wallet balance. Please add money first.")
    await db.users.update_one({"id": user["id"]}, {"$inc": {"wallet_balance": -b["amount"]}})
    await db.wallet_txns.insert_one({
        "id": new_id(), "user_id": user["id"], "amount": -b["amount"],
        "type": "booking_payment", "booking_id": booking_id, "created_at": now_iso(),
    })
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": "confirmed", "paid_at": now_iso()}})
    return {"success": True, "message": "Payment successful. Booking confirmed."}


@api.post("/bookings/{booking_id}/review")
async def add_review(booking_id: str, body: ReviewIn, user: dict = Depends(current_user)):
    b = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not b or b["customer_id"] != user["id"]:
        raise HTTPException(404, "Booking not found")
    if b["status"] != "completed":
        raise HTTPException(400, "Can only review completed bookings")
    if not (1 <= body.rating <= 5):
        raise HTTPException(400, "Rating 1-5")
    doc = {
        "id": new_id(),
        "booking_id": booking_id,
        "artist_id": b["artist_id"],
        "customer_id": user["id"],
        "customer_name": user.get("name", "Customer"),
        "rating": body.rating,
        "comment": body.comment,
        "created_at": now_iso(),
    }
    await db.reviews.insert_one({**doc})
    return {k: v for k, v in doc.items() if k != "_id"}


# ---------- WALLET ----------
@api.get("/wallet")
async def wallet(user: dict = Depends(current_user)):
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    txns = await db.wallet_txns.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"balance": u.get("wallet_balance", 0), "transactions": txns}


@api.post("/wallet/add")
async def wallet_add(body: WalletAdd, user: dict = Depends(current_user)):
    if body.amount <= 0:
        raise HTTPException(400, "Invalid amount")
    # MOCK Razorpay success
    await db.users.update_one({"id": user["id"]}, {"$inc": {"wallet_balance": body.amount}})
    await db.wallet_txns.insert_one({
        "id": new_id(), "user_id": user["id"], "amount": body.amount,
        "type": "wallet_topup", "razorpay_payment_id": body.razorpay_payment_id or f"mock_{new_id()}",
        "created_at": now_iso(),
    })
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return {"balance": u["wallet_balance"]}


# ---------- ADMIN ----------
@api.get("/admin/pending-verifications")
async def pending_verifs(admin: dict = Depends(require_admin)):
    artists = await db.artist_profiles.find(
        {"verification_submitted": True, "verified": False}, {"_id": 0}
    ).to_list(200)
    return artists


@api.post("/admin/verify/{artist_id}")
async def verify_artist(artist_id: str, approve: bool = True, admin: dict = Depends(require_admin)):
    await db.artist_profiles.update_one(
        {"id": artist_id},
        {"$set": {"verified": approve, "verified_at": now_iso() if approve else None}},
    )
    return {"success": True, "verified": approve}


@api.get("/admin/users")
async def admin_users(admin: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return users


@api.get("/admin/bookings")
async def admin_bookings(admin: dict = Depends(require_admin)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return bookings


@api.get("/admin/stats")
async def admin_stats(admin: dict = Depends(require_admin)):
    return {
        "users": await db.users.count_documents({}),
        "artists": await db.artist_profiles.count_documents({}),
        "verified_artists": await db.artist_profiles.count_documents({"verified": True}),
        "bookings": await db.bookings.count_documents({}),
        "pending_verifications": await db.artist_profiles.count_documents({"verification_submitted": True, "verified": False}),
    }


# ---------- Health ----------
@api.get("/")
async def root():
    return {"app": "ArtistKhojo", "status": "ok"}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown():
    client.close()
