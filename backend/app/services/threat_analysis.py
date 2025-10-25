def analyze_threat(url: str = None, user_agent: str = None, ip_address: str = None) -> float:
    """Basic threat analysis - returns threat score 0-100"""
    threat_score = 0.0

    if user_agent:
        suspicious_agents = ['curl', 'wget', 'python', 'scraper']
        if any(agent in user_agent.lower() for agent in suspicious_agents):
            threat_score += 30.0

    if url:
        suspicious_patterns = ['admin', '../', 'script', 'eval']
        if any(pattern in url.lower() for pattern in suspicious_patterns):
            threat_score += 40.0

    return min(threat_score, 100.0)