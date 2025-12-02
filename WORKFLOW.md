---
description: How to maintain system documentation and help pages
---

# Documentation Maintenance Workflow

This workflow ensures that the system documentation (specifically the Help page) stays in sync with the actual features and version of the application.

## When to Run
*   **New Feature Release**: When a new feature is merged into `main`.
*   **Version Bump**: When the `package.json` version is updated.
*   **UI/UX Changes**: When significant changes are made to the user interface.

## Steps

1.  **Update Help Page Content**
    *   Open `dashboard/app/help/page.tsx`.
    *   Locate the relevant `TabPanel` for the modified module (e.g., Dashboard, Portfolio, Architecture).
    *   Update the text to reflect the new functionality.
    *   If a new module is added, add a new `Tab` and `TabPanel`.

2.  **Verify Links**
    *   Ensure any internal links in the documentation point to valid routes.

3.  **Commit Changes**
    *   Include the documentation update in the same PR as the feature implementation.
    *   Commit message example: `feat(portfolio): add revenue insights and update help docs`

## Versioning Strategy
The application automatically displays the current version and commit hash in the bottom right corner (via `VersionDisplay.tsx`).
*   Clicking this version number redirects the user to `/help`.
*   Ensure the "System Documentation" page mentions any critical version-specific notes if necessary.

## Automated Checks (Future)
*   Consider adding a CI step to check for broken links in the documentation.
