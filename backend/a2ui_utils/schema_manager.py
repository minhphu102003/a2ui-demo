from a2ui.schema.manager import A2uiSchemaManager
from a2ui.basic_catalog import BasicCatalog


def get_schema_manager() -> A2uiSchemaManager:
    """Create and return an A2UI schema manager with the basic catalog."""
    catalog_config = BasicCatalog.get_config(version="0.9")
    return A2uiSchemaManager(
        version="0.9",
        catalogs=[catalog_config],
    )


schema_manager = get_schema_manager()
