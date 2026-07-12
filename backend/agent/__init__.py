from .graph import create_agent

_agent = None


def get_agent():
    global _agent
    if _agent is None:
        _agent = create_agent()
    return _agent
