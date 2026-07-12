# Delta for Frontend Catalog

## ADDED Requirements

### Requirement: CourseCard Component
The system SHALL render course cards with thumbnail, title, instructor, and description.

#### Scenario: Display course
- GIVEN a CourseCard component
- WHEN rendered with course props
- THEN the thumbnail image is displayed
- AND the title is shown
- AND the instructor name is shown
- AND the description is shown

#### Scenario: Click navigation
- GIVEN a CourseCard with an action
- WHEN the user clicks the card
- THEN `router.push()` is called with the action URL

### Requirement: Component Overrides
The system SHALL override basic A2UI components with Tailwind CSS.

#### Scenario: Text override
- GIVEN the Text component is overridden
- WHEN rendered with a variant
- THEN appropriate Tailwind classes are applied

#### Scenario: Button override
- GIVEN the Button component is overridden
- WHEN rendered
- THEN it has `bg-blue-500 hover:bg-blue-600 text-white rounded-lg` classes

#### Scenario: Layout overrides
- GIVEN Row, Column, Card, List components
- WHEN rendered
- THEN flexbox layout classes are applied

### Requirement: Catalog Registration
The system SHALL register all custom components in a catalog.

#### Scenario: Catalog creation
- GIVEN custom components are defined
- WHEN `courseCatalog` is created
- THEN it includes CourseCard and all overrides
- AND it includes the basic catalog
