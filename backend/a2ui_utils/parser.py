import logging
from a2ui.parser.parser import parse_response
from a2ui.core import A2uiParseError
from a2ui.schema.validator import A2uiValidator

from a2ui_utils.schema_manager import schema_manager

logger = logging.getLogger(__name__)


def parse_a2ui_response(content: str) -> list[dict]:
    """Parse A2UI JSON from LLM text output.

    Args:
        content: Raw LLM response text

    Returns:
        List of parsed A2UI message dicts

    Raises:
        ValueError: If no valid A2UI JSON found
    """
    try:
        parts = parse_response(content)
        results = []
        for part in parts:
            if part.a2ui_json:
                if isinstance(part.a2ui_json, list):
                    results.extend(part.a2ui_json)
                else:
                    results.append(part.a2ui_json)
        if not results:
            raise ValueError("No A2UI messages found in response")
        return results
    except A2uiParseError as e:
        raise ValueError(str(e)) from e


def validate_message(message: dict) -> bool:
    """Validate an A2UI message against the schema.

    Args:
        message: A2UI message dict

    Returns:
        True if valid, False otherwise
    """
    try:
        catalog = schema_manager.get_selected_catalog()
        validator = A2uiValidator(catalog)
        validator.validate(message)
        return True
    except Exception as e:
        logger.warning(f"Validation error: {e}")
        return False
