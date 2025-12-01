# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.1] - 2025-12-01
### Added
- **Portfolio Management Report**: A new interactive page (`/report/portfolio`) for managing Business Canvas data.
- **Canvas Item Library**: A sidebar with reusable standard items (e.g., "SaaS Subscription", "Enterprise") that can be dragged onto the canvas.
- **Drag-and-Drop Editor**: Fully interactive editor using `@dnd-kit` for reordering and adding items.
- **Smart Defaults**: Automatically populates empty canvas sections based on repository metadata.
- **Context Header**: Displays repository details (Name, Description, Tech Stack) in the editor.

### Fixed
- **Portfolio Data Loading**: Resolved issues with parsing nested API responses and handling `repoId` URL parameters.
- **Hydration Errors**: Fixed hydration mismatches in the Navbar.

## [0.5.7] - 2025-12-01
### Fixed
- **Portfolio Runtime Error**: Resolved a critical "Objects are not valid as a React child" error in the Portfolio view.
    - Added defensive coding to `app/portfolio/page.tsx` to safely handle non-string data in `valueProposition`, `customerSegments`, `revenueStreams`, and `costStructure`.
    - Implemented JSON stringification for object-based data fields to prevent rendering crashes.

## [0.3.0] - 2025-11-29
### Added
- **System Maintenance UI**: New page `/maintenance` for running ecosystem standardization scripts (Node.js, TypeScript, Next.js Audit).
    - **Audit Report Viewer**: View generated CSV audit reports directly in the browser.
    - **Auto-Fixers**: One-click standardization for Node.js engines and TypeScript versions.
    - **System Logs**: Real-time logging of script executions.
- **Task Management**:
    - **Dashboard Indicators**: Colored badges (Red/Orange/Blue) on repository cards showing open tasks by priority.
    - **Priority Filter**: Filter repositories to show only those with "Critical" tasks.
    - **Priority Sort**: Sort repositories by task priority.
    - **List View Support**: Task indicators added to the table view.
- **API**:
    - `api/scripts/run`: Endpoint to execute maintenance scripts.
    - `api/logs`: Endpoint to fetch system logs.
    - `api/files/content`: Endpoint to safely read report files.

### Changed
- **Resilience**: Refactored `api/repos` to fetch tasks separately, preventing dashboard crashes when database schema is out of sync.
- **Scripts**: Updated standardization scripts to support non-interactive mode (`--yes`) for API usage.

## [0.2.0] - 2025-11-29
### Added
- **AI Architecture Reporting**: New module `/report` that uses Perplexity AI (via OpenAI client) to analyze system metadata and generate actionable architecture reports in German.
    - Includes internal linking to dashboard modules (Repos, Logs, DNS).
    - Manual fallback mechanism for robust operation without server restarts.
- **CI/CD Pipeline**: GitHub Actions workflow (`.github/workflows/ci.yml`) for automated Linting, Building, and Verification on every push.
- **UI Enhancements**:
    - High-contrast "Generate Report" button.
    - Styled Markdown links in reports for better visibility.
    - Improved navigation header with "AI Report" badge.

### Changed
- **Documentation**: Updated README and added professional Changelog.
- **API**: Enhanced `api/ai/generate` to support direct `.env` file reading for hot-reloading API keys.

## [0.1.7] - 2025-11-29
### Fixed
- **API Key Loading**: Implemented direct file system read for `.env` to bypass process cache in API routes.
- **Dependencies**: Resolved peer dependency conflicts with `dotenv` and `react-markdown`.

## [0.1.6] - 2025-11-29
### Changed
- **UI**: Improved link styling in AI reports (Violet color, underline).

## [0.1.5] - 2025-11-29
### Added
- **CI/CD**: Initial GitHub Actions configuration.
- **Scripts**: Added `eslint-disable` to build scripts to pass linting.

## [0.1.0] - 2025-11-28
### Added
- **Dashboard**: Initial release of the Architecture Review Dashboard.
- **Features**:
    - Repository Overview & Detail Views.
    - Technology Tracking.
    - Interface Visualization.
    - DNS & Deployment Management.
    - Central Data Sync.
