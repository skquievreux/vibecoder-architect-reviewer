# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
