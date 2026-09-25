from fastapi import APIRouter
from app.services.decision_engine import generate_decision

router = APIRouter()


@router.post("/")
def analyze_input(batch: dict):
    decision = generate_decision(batch)

    return {
        "status": "analyzed",
        "message": "Batch analyzed by the decision engine",
        "data": batch,
        "decision": decision
    }