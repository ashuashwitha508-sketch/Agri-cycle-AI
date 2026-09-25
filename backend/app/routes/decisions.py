from fastapi import APIRouter

router = APIRouter()

decisions = []

@router.post("/")
def create_decision(decision: dict):
    decisions.append(decision)
    return {
        "success": True,
        "message": "Human decision recorded successfully",
        "decision": decision
    }

@router.get("/")
def get_decisions():
    return decisions
