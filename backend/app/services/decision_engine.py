def generate_decision(batch):
    harvest_age = batch.get("harvest_age_days", 0)
    temperature = batch.get("temperature_c", 0)
    humidity = batch.get("humidity_percent", 0)
    transport = batch.get("transport_time_hours", 0)
    demand = batch.get("demand_level", "Medium")

    risk_score = 0

    if harvest_age >= 4:
        risk_score += 30

    if temperature >= 30:
        risk_score += 25

    if humidity >= 75:
        risk_score += 20

    if transport >= 6:
        risk_score += 15

    if demand == "High":
        risk_score += 10

    if risk_score >= 70:
        risk_level = "High"
        priority = 1
        recommendation = "SELL NOW"
    elif risk_score >= 40:
        risk_level = "Medium"
        priority = 2
        recommendation = "PROCESS"
    else:
        risk_level = "Low"
        priority = 3
        recommendation = "STORE"

    confidence = min(95, 60 + risk_score // 3)

    return {
        "risk_level": risk_level,
        "priority": priority,
        "recommendation": recommendation,
        "confidence": confidence,
        "reason": "Decision based on harvest age, temperature, humidity, transport exposure and demand."
    }