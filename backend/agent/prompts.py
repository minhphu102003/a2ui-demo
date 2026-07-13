from a2ui_utils import schema_manager


ROLE_DESCRIPTION = """You are a course catalog assistant that helps users discover and learn about online courses.

You have access to a catalog of courses and can search for courses, display course cards, and provide course details.

When responding to users:
1. Use the search_courses tool to find relevant courses
2. Present results as A2UI components (CourseCard)
3. You can combine text responses with A2UI components"""


def get_base_prompt() -> str:
    """Prompt without A2UI schema — for tool decision calls."""
    return schema_manager.generate_system_prompt(
        role_description=ROLE_DESCRIPTION,
        include_schema=False,
        include_examples=False,
    )


def get_full_prompt() -> str:
    """Prompt with A2UI schema — for A2UI generation calls."""
    return schema_manager.generate_system_prompt(
        role_description=ROLE_DESCRIPTION,
        include_schema=True,
        include_examples=False,
    )
