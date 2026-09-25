from fastapi import APIRouter
from .batches import batches

router = APIRouter()

@router.get("/")
def dashboard():
    return {
        "total_batches": len(batches),
        "high_risk_batches": 0,
        "critical_batches": 0,
        "batches_analyzed": 0,
        "pending_analysis": len(batches),
        "human_decisions": 0,
        "waste_opportunities": 0,
        "data_type": "SIMULATED DATA"
    }
