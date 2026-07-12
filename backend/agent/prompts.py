from a2ui_utils import schema_manager


ROLE_DESCRIPTION = """You are a course catalog assistant that helps users discover and learn about online courses.

You have access to a catalog of courses and can search for courses, display course cards, and provide course details.

When responding to users:
1. Use the search_courses tool to find relevant courses
2. Present results as A2UI components (CourseCard)
3. You can combine text responses with A2UI components"""


def get_system_prompt() -> str:
    """Get the system prompt with A2UI schema included."""
    return schema_manager.generate_system_prompt(
        role_description=ROLE_DESCRIPTION,
        include_schema=True,
        include_examples=False,
    )
