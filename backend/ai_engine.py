from transformers import pipeline

# Lazy model loading
sentiment_pipeline = None

def get_model():
    global sentiment_pipeline
    if sentiment_pipeline is None:
        sentiment_pipeline = pipeline("sentiment-analysis")
    return sentiment_pipeline


distress_keywords = [
    "help",
    "scared",
    "not safe",
    "please",
    "stop",
    "leave me",
    "i guess",
    "dont know"
]


def keyword_score(text):
    score = 0
    for word in distress_keywords:
        if word in text.lower():
            score += 15
    return min(score, 100)


def emotion_score(text):
    model = get_model()
    result = model(text)[0]

    if result["label"] == "NEGATIVE":
        return result["score"] * 100
    else:
        return 0


def behavior_score(typing_speed, backspaces, pause_time):
    score = 0

    if typing_speed < 2:
        score += 30

    if backspaces > 5:
        score += 30

    if pause_time > 3:
        score += 30

    return min(score, 100)


def calculate_risk(message, typing_speed, backspaces, pause_time):
    e_score = emotion_score(message)
    k_score = keyword_score(message)
    b_score = behavior_score(typing_speed, backspaces, pause_time)

    risk = (
        e_score * 0.5 +
        b_score * 0.3 +
        k_score * 0.2
    )

    level = "LOW"
    popup = False

    # Lowered threshold slightly for demo smoothness
    if risk > 60:
        level = "HIGH"
        popup = True
    elif risk > 40:
        level = "MEDIUM"

    return {
        "risk_score": int(risk),
        "level": level,
        "popup": popup,
        "emotion_score": int(e_score),
        "behavior_score": int(b_score),
        "keyword_score": int(k_score)
    }