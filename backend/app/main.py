from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import batches, analysis, decisions, waste, dashboard

app = FastAPI(
    title="AgriCycle AI Backend",
    description="Backend API for AgriCycle AI – The Second Harvest",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(batches.router, prefix="/batches", tags=["Batches"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
app.include_router(decisions.router, prefix="/decisions", tags=["Decisions"])
app.include_router(waste.router, prefix="/waste", tags=["Waste"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])


@app.get("/")
def root():
    return {
        "message": "AgriCycle AI Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
