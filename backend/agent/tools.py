import json
from langchain_core.tools import tool


MOCK_COURSES = [
    {
        "id": 1,
        "title": "React Fundamentals",
        "instructor": "John Doe",
        "description": "Learn React from scratch with hands-on projects",
        "thumbnail": "https://picsum.photos/seed/react/400/225",
        "duration": "8 hours",
        "level": "Beginner",
        "rating": 4.8,
        "students": 12500,
    },
    {
        "id": 2,
        "title": "Advanced React Patterns",
        "instructor": "Jane Smith",
        "description": "Master advanced React patterns and best practices",
        "thumbnail": "https://picsum.photos/seed/advanced-react/400/225",
        "duration": "12 hours",
        "level": "Advanced",
        "rating": 4.9,
        "students": 8200,
    },
    {
        "id": 3,
        "title": "React Native Mobile Development",
        "instructor": "Mike Johnson",
        "description": "Build cross-platform mobile apps with React Native",
        "thumbnail": "https://picsum.photos/seed/react-native/400/225",
        "duration": "15 hours",
        "level": "Intermediate",
        "rating": 4.7,
        "students": 9800,
    },
    {
        "id": 4,
        "title": "TypeScript for React Developers",
        "instructor": "Sarah Wilson",
        "description": "Learn TypeScript in the context of React development",
        "thumbnail": "https://picsum.photos/seed/typescript/400/225",
        "duration": "6 hours",
        "level": "Intermediate",
        "rating": 4.6,
        "students": 15300,
    },
    {
        "id": 5,
        "title": "Next.js Full Stack Development",
        "instructor": "David Brown",
        "description": "Build full-stack applications with Next.js and React",
        "thumbnail": "https://picsum.photos/seed/nextjs/400/225",
        "duration": "20 hours",
        "level": "Intermediate",
        "rating": 4.8,
        "students": 11200,
    },
]


@tool
def search_courses(query: str) -> str:
    """Search for courses by title or description.

    Args:
        query: Search query to filter courses

    Returns:
        JSON string of matching courses
    """
    query_lower = query.lower()
    results = [
        course
        for course in MOCK_COURSES
        if query_lower in course["title"].lower()
        or query_lower in course["description"].lower()
    ]

    if not results:
        results = MOCK_COURSES[:3]

    return json.dumps(results, indent=2)


@tool
def get_course_details(course_id: int) -> str:
    """Get detailed information about a specific course.

    Args:
        course_id: The ID of the course to retrieve

    Returns:
        JSON string with course details
    """
    for course in MOCK_COURSES:
        if course["id"] == course_id:
            return json.dumps(course, indent=2)

    return json.dumps({"error": f"Course with ID {course_id} not found"})
