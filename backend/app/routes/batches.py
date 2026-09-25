from fastapi import APIRouter

router = APIRouter()

batches = [
    {
        "batch_id": "B001",
        "crop_type": "Tomato",
        "quantity_kg": 500,
        "harvest_age_days": 4,
        "temperature_c": 30,
        "humidity_percent": 75,
        "transport_time_hours": 6,
        "demand_level": "High"
    },
    {
        "batch_id": "B002",
        "crop_type": "Mango",
        "quantity_kg": 300,
        "harvest_age_days": 2,
        "temperature_c": 27,
        "humidity_percent": 65,
        "transport_time_hours": 3,
        "demand_level": "Medium"
    },
    {
        "batch_id": "B003",
        "crop_type": "Tomato",
        "quantity_kg": 400,
        "harvest_age_days": 6,
        "temperature_c": 34,
        "humidity_percent": 88,
        "transport_time_hours": 8,
        "demand_level": "High"
    }
]


@router.get("/")
def get_batches():
    return {
        "data_type": "SIMULATED DATA",
        "batches": batches
    }


@router.get("/{batch_id}")
def get_batch(batch_id: str):
    for batch in batches:
        if batch["batch_id"] == batch_id:
            return batch

    return {"error": "Batch not found"}
