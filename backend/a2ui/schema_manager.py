from a2ui.schema.manager import A2uiSchemaManager
from a2ui.schema.catalog import CatalogConfig
from a2ui.basic_catalog.provider import BasicCatalogProvider


def get_schema_manager() -> A2uiSchemaManager:
    """Create and return an A2UI schema manager with the basic catalog."""
    catalog_config = CatalogConfig(
        name="basic",
        provider=BasicCatalogProvider(),
    )
    return A2uiSchemaManager(
        version="0.9",
        catalogs=[catalog_config],
    )


schema_manager = get_schema_manager()
