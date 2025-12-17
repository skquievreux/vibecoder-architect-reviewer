## [1.8.16](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.15...v1.8.16) (2025-12-17)


### Bug Fixes

* **config:** remove markdown artifacts from package.json ([473c568](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/473c5681087a91ea1f83fdf8e1250cdde412f8ef))

## [2.0.0] (2025-12-17) - OFFICIAL CLOUD LAUNCH 🚀

### 🏗️ Architecture & Deployment
* **Fly.io PostgreSQL**: Successfully migrated production database from SQLite to a managed PostgreSQL cluster on Fly.io.
* **Vercel Deployment**: Established enterprise-grade CI/CD pipeline on Vercel with automated builds and preview deployments.
* **Hybrid Architecture**: Optimized setup running frontend/API on Vercel Edge Network and persistent data on Fly.io.

### 🛡️ Security & Auth
* **GitHub OAuth**: Configured production-ready GitHub OAuth authentication with secure callback URLs.
* **CVE Remediation**: Updated Next.js to v16.0.10 to resolve critical security vulnerability (CVE-2025-66478).
* **Middleware**: Modernized NextAuth middleware for Next.js 16 compatibility.

### ⚡ Performance & Stability
* **Static Generation**: Implementing `<Suspense>` boundaries for `useSearchParams` across all Auth and Dashboard pages to enable full static optimization.
* **Prisma Build Pipeline**: Fixed Vercel build process by injecting `prisma generate` into build steps.
* **React 18 Stabilization**: Pinned React to v18.3.1 to ensure ecosystem compatibility while leveraging Next.js 16 features.

### 📦 Data & Content
* **Full Cloud Seeding**: Restored complete portfolio state (63 repositories, 7 ADRs, Interface Registry) to the new cloud database.
* **ADR System**: Updated Architecture Decision Records to reflect the new Hosting Strategy (Vercel + Hetzner/Fly).

## [1.8.15](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.14...v1.8.15) (2025-12-17)


### Bug Fixes

* **security:** remove unused useSearchParams from SecurityDashboard ([869fd00](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/869fd00655ff421264c415643880b38e7636d609))

## [1.8.14](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.13...v1.8.14) (2025-12-17)


### Bug Fixes

* **auth-error:** wrap AuthErrorPage in Suspense ([838171a](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/838171acdc0b4d8bb823a788909b9a7cf372d03c))

## [1.8.13](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.12...v1.8.13) (2025-12-17)


### Bug Fixes

* **auth:** wrap SignInPage in Suspense for Next.js build ([2f883fa](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/2f883fa7d549d24e34c7af479f62a5738496fd5f))

## [1.8.12](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.11...v1.8.12) (2025-12-17)


### Bug Fixes

* **middleware:** explicit export for next-auth middleware ([4adea7a](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/4adea7aa6331d0bce4eec53ac21e5720af73e9e5))

## [1.8.11](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.10...v1.8.11) (2025-12-17)


### Bug Fixes

* **build:** add prisma generate to build script for Vercel ([bdc757b](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/bdc757b69878dd9ba999762dcfd09f81bae25f5d))

## [1.8.10](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.9...v1.8.10) (2025-12-17)


### Bug Fixes

* **scripts:** add required fullName to repository sync script ([5d5eda5](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/5d5eda5861a846168a3f8654faa924b93e7425d1))

## [1.8.9](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.8...v1.8.9) (2025-12-17)


### Bug Fixes

* **git:** remove invalid submodule reference to temp_fix_2/playlist_generator ([202eedb](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/202eedbabe718f65a63646830de1abce158be173))

## [1.8.8](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.7...v1.8.8) (2025-12-17)


### Bug Fixes

* **ui:** correct next-themes type import path ([d7bfb2c](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/d7bfb2c9727c707466f21e8db30b3c16facdd1d0))

## [1.8.7](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.6...v1.8.7) (2025-12-17)


### Bug Fixes

* **api:** update route handler params to awaitable promise for Next.js 15+ ([5db0f47](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/5db0f4729cf255f150436e5cbc5cb3d7a042082a))

## [1.8.6](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.5...v1.8.6) (2025-12-17)


### Bug Fixes

* **build:** resolve path reference error in build script & migrate to postgres ([4d4f44b](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/4d4f44bd5b4b2107ecabec6a16da6ec8ef5b54f3))

## [1.8.5](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.4...v1.8.5) (2025-12-17)


### Bug Fixes

* bump version to 1.8.5 to match main branch progression ([30abad5](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/30abad5e40d69fe5a0a85b4751437912a3584a76))
* update workflow deployment scripts and docs ([181c234](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/181c2347c2e49cc5e3de38f9cb4c28b9034e3310))

## [1.8.4](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.3...v1.8.4) (2025-12-12)


### Bug Fixes

* release version 0.11.2 ([568aedf](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/568aedf7d05e599b7be7b2b9c1fc0ddb7ee06bb2))

# Changelog

## [0.11.1] - 2025-12-11

### 🐛 Bug Fixes

#### Critical Fixes
- **Fixed Sync Failure**: Resolved `analyzer.py` file not found error that prevented repository synchronization
- **Private Repository Support**: Fixed analyzer to properly fetch private repositories using authenticated GitHub API endpoint
- **Database Seeding Path**: Corrected `analysis_results.json` path resolution in seed script
- **Environment Variable Loading**: Added `python-dotenv` support to analyzer for proper `.env.local` file loading

#### API & Integration Fixes
- **GitHub API Parameter Conflict**: Removed conflicting `type` parameter when using `affiliation` for authenticated user repos
- **Repository Count**: Now correctly displays public vs private repository counts (e.g., "63 repositories (15 public, 48 private)")

### ✨ New Features

#### Setup & Configuration
- **`.env.example`**: Created comprehensive environment variable template with detailed documentation
  - All required and optional variables documented
  - Setup instructions and links to create API keys
  - Organized by category (Database, GitHub, AI, Auth, etc.)
- **Environment Checker**: New `check-env.js` script to validate all environment variables
- **Quick Setup Script**: Added `quick-setup.js` for automated project initialization

#### Documentation
- **`SETUP.md`**: Complete German setup guide with step-by-step instructions
- **`SETUP_COMPLETE.md`**: Summary of all setup changes and next steps
- **`analysis/README.md`**: Detailed documentation for the GitHub analyzer
- **Troubleshooting Guide**: Common issues and solutions documented

#### Python Analyzer Improvements
- **Private Repository Detection**: Automatically detects if analyzing own repos vs others
- **Enhanced Logging**: Shows detailed progress and repository counts
- **Better Error Handling**: Improved error messages and validation
- **Technology Detection**: Enhanced framework and dependency detection

### 🔧 Configuration Changes

#### `.gitignore` Updates
- Added exception for `.env.example` (now tracked in Git)
- Added exception for `analysis/*.py` files
- Refined analysis directory ignoring (only ignores generated files)

#### Python Dependencies
- Added `python-dotenv==1.0.0` for environment variable management
- Updated `requirements.txt` with all necessary dependencies

### 📊 Database Improvements
- **Increased Repository Count**: Successfully imported 63 repositories (previously 15)
- **Technology Detection**: Imported 284 technologies (previously 45)
- **Private Repository Data**: Now includes data from private repositories

### 🛠️ Developer Experience
- **Helper Scripts**: Added multiple utility scripts for common tasks
  - `check-env.js` - Validate environment configuration
  - `check-logs.js` - View sync logs
  - `check-db.js` - Check database status
  - `check-db-counts.js` - View database statistics
  - `quick-setup.js` - Automated setup wizard

### 📝 Files Added
- `.env.example` - Environment variable template
- `SETUP.md` - Setup documentation
- `SETUP_COMPLETE.md` - Setup summary
- `analysis/analyzer.py` - GitHub repository analyzer
- `analysis/requirements.txt` - Python dependencies
- `analysis/README.md` - Analyzer documentation
- `check-env.js` - Environment validator
- `quick-setup.js` - Setup automation

### 📝 Files Modified
- `.gitignore` - Updated to allow specific files
- `prisma/seed.ts` - Fixed path to analysis results
- `analysis/analyzer.py` - Enhanced with private repo support
- `package.json` - Version bump to 0.11.1
- `VERSION` - Updated to 0.11.1

### 🔍 Testing & Validation
- ✅ All environment variables validated
- ✅ Python analyzer tested with 63 repositories
- ✅ Database seeding verified
- ✅ Private repository access confirmed
- ✅ Sync functionality tested via Dashboard

### 📈 Statistics
- **Repositories**: 15 → 63 (+48 private repositories)
- **Technologies**: 45 → 284 (+239 detected technologies)
- **Setup Time**: Reduced with automated scripts
- **Documentation**: 4 new comprehensive guides


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
