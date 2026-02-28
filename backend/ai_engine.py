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
    
    label = result["label"]
    score = result["score"]

    if label == "NEGATIVE":
        # Return a simulated emotion label based on strength so the dynamic reply still works a bit
        simulated_label = "fear" if score > 0.8 else "sadness"
        return score * 100, simulated_label
    else:
        return 0, "neutral"


def behavior_score(typing_speed, backspaces, pause_time, baseline_speed, baseline_backspaces, baseline_pause):
    score = 0
    
    # Use baselines if provided, otherwise fallback to generic defaults
    def_speed = baseline_speed if baseline_speed > 0 else 40
    def_backs = baseline_backspaces
    def_pause = baseline_pause

    if typing_speed < (def_speed * 0.5): # typing at less than half their usual speed
        score += 30

    if backspaces > (def_backs + 3): # 3 more backspaces than their usual message
        score += 30

    if pause_time > (def_pause + 2): # pausing 2 seconds more than usual
        score += 30

    return min(score, 100)


def generate_dynamic_reply(level, emotion_score, emotion_label, message):
    if level == "HIGH" or emotion_label in ["fear", "panic"]:
        return "I can hear how difficult this is for you right now. Please know that you are not alone, and help is available. I'm here to listen."
    
    if emotion_label == "sadness" or emotion_label == "grief":
        return "I'm so sorry you're feeling this way. It's completely okay to feel sad. I'm here to support you."
        
    if emotion_label == "anger" or emotion_label == "annoyance":
        return "That sounds incredibly frustrating. It makes total sense that you'd feel that way."

    if level == "MEDIUM":
        return "It sounds like you're going through a really tough time. Thank you for trusting me enough to share this. How can I support you right now?"
        
    if emotion_score > 80:
        return f"It seems like you're experiencing a lot of {emotion_label}. I'm so sorry you're dealing with that. I am here for you."
    elif emotion_score > 50:
        return "It sounds like this is causing you some distress. I appreciate you sharing; I'm here to listen whenever you're ready."
        
    # Default supportive response for LOW risk and low negative emotion
    return "Thank you for sharing that with me. I'm listening—feel free to tell me more when you're comfortable."


def calculate_risk(message, typing_speed, backspaces, pause_time, baseline_speed, baseline_backspaces, baseline_pause):
    e_score, emotion_label = emotion_score(message)
    k_score = keyword_score(message)
    b_score = behavior_score(typing_speed, backspaces, pause_time, baseline_speed, baseline_backspaces, baseline_pause)

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

    reply = generate_dynamic_reply(level, e_score, emotion_label, message)

    return {
        "risk_score": int(risk),
        "level": level,
        "popup": popup,
        "emotion_score": int(e_score),
        "emotion_label": emotion_label,
        "behavior_score": int(b_score),
        "keyword_score": int(k_score),
        "reply": reply
    }