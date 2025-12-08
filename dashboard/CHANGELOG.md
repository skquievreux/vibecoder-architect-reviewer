# Changelog

## [0.9.6] - 2025-12-08

### Added
- **Tailwind CSS v4.0 Support**: Upgraded the design system to support the latest Tailwind CSS v4.0 features (`feature/upgrade-tailwind-4`).
- **Dashboard Integration**: Fully integrated the dashboard application into the main repository structure.

### Fixed
- **Build Stability**: Resolved duplicate type definitions in `app/repo/[name]/page.tsx` and excluded temporary fix files from the build process to ensure a stable release.


## [0.9.2] - 2025-12-02

### Added
- **Manual Provider Selection**: Users can now manually link and unlink providers (e.g., Lemon Squeezy, Vercel) to repositories via the dashboard UI.
- **Vercel Integration**: Enhanced CLI sync script to better detect projects and link them to repositories.

## [0.9.1] - 2025-12-02

### Added
- **AI Architect Chat Intelligence**: The chat at `/architect/chat` now connects to the Perplexity/OpenAI API (via `OPENAI_API_KEY` or `PERPLEXITY_API_KEY`) to provide real-time, context-aware architectural advice based on "Golden Paths" and ADRs.
- **Image Optimization Script**: Added `scripts/optimize-images.js` to the prebuild process to verify and prepare images.

### Fixed
- **Task Visibility**: Resolved an issue where tasks were missing from the dashboard by reseeding the database (`scripts/seed-tasks.js`).
- **AI Chat History**: Fixed an API error where the chat history was sent in an invalid order for the Perplexity API.

### Verified
- **Golden Paths**: Confirmed that AI recommendations align with project standards (Next.js, Supabase, Fly.io, TypeScript Strict Mode).

## [0.9.0] - Previous Version
- Initial dashboard release with Portfolio Manager, Tech Radar, and Reporting.
