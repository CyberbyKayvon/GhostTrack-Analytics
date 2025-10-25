def detect_bot(user_agent: str = None) -> bool:
    """Simple bot detection based on user agent"""
    if not user_agent:
        return False

    user_agent_lower = user_agent.lower()
    bot_keywords = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget']

    return any(keyword in user_agent_lower for keyword in bot_keywords)