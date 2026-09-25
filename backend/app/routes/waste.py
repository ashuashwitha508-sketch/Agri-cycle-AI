from fastapi import APIRouter

router = APIRouter()

@router.post("/match")
def match_waste(data: dict):
    waste_type = data.get("waste_type", "Unknown")

    pathways = {
        "Tomato residue": ["Compost", "Vermicompost", "Organic manure"],
        "Rice straw": ["Compost", "Mulch", "Biomass", "Biochar"],
        "Wheat straw": ["Compost", "Mulch", "Biomass"],
        "Maize residue": ["Compost", "Mulch", "Biomass", "Biochar"]
    }

    return {
        "waste_type": waste_type,
        "possible_uses": pathways.get(
            waste_type,
            ["Compost", "Organic manure"]
        ),
        "data_type": "PROTOTYPE/POSSIBLE PATHWAYS"
    }
