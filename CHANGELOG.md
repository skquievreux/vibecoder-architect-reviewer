# [2.2.0](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v2.1.0...v2.2.0) (2025-12-21)


### Bug Fixes

* add vercel.json configuration for Intel AMD build ([5a14f80](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/5a14f803965e9c73fddbbe698348e1a8f78e0a80))
* Correct syntax errors in API routes ([e39f156](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/e39f156ca1eb0c16ac39f625c7124d6faa3a2957))
* Make repositoryId optional in RepoTask model ([47457a4](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/47457a41bcf35e09519abcd198601a31e84ebc67))
* Remove deprecated Vercel runtime configuration ([86ba90c](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/86ba90c0940b481f18cb870bdfc8c13415d6c34c))
* remove problematic AI tasks routes to resolve build errors ([a4d17a0](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/a4d17a057c95c28db106a87c4cc96c54a4ac6c56))
* resolve PDF generation and task verification issues ([3a11ab0](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/3a11ab0d08ad6105c94074159f18ca75f4711a05))
* revert to Prisma 5.22.0 to resolve stability issues with providers ([4e22d8f](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/4e22d8f48c3adc89313b98c4e27579e101ae7289))


### Features

* Add Favorites UI and Mobile Layout Optimizations ([cbdfe40](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/cbdfe40790eb1fefaac3639107fe8472f63d0bff))
* automated portfolio intelligence pipeline ([35b7b8e](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/35b7b8effcbcd3dd183872c441d60ea129546676))
* implement mobile optimization with SwipeableRow and ActionGroup components ([8b44cfb](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/8b44cfb3024779d9d5c291a48f1dd26f43f7d4a3))
* release version 1.12.0 with portfolio pipeline ([7bed861](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/7bed8618847cca1a33abd901911e4bdfcf7a7882))

## [1.12.0] (2025-12-21) - Automated Portfolio Intelligence 🧠

### 🚀 Key Features

#### 🧠 Automated Portfolio Intelligence Pipeline
- **AI-Driven Analysis**: Automatically scans, harvests, and analyzes all 72+ repositories using LLMs to extract business value, value propositions, and customer segments from `README.md` and `package.json`.
- **Zero-Manual-Entry**: Eliminates the need for manual data entry of portfolio details. The pipeline updates the database and dashboard automatically.
- **Refresh Pipeline**: New command `npm run portfolio:refresh` to trigger a full re-harvest and analysis cycle.
- **Portfolio Summary**: Automatically generates a comprehensive `PORTFOLIO_SUMMARY.md` report ready for PDF export or CV use.

### 🛡️ Architecture
- **Intelligence Module**: New `scripts/intelligence/` module with `harvest.ts`, `analyze.ts`, and `sync-db.ts`.
- **Robust Parsing**: Added improved JSON parsing resilience for AI responses.
- **Perplexity Integration**: Switched to `sonar-pro` model for high-quality, up-to-date analysis of technical documentation.

---

## [1.11.0] (2025-12-20) - Extended Providers & Stability 🛡️

### 🚀 Key Features

#### 🔌 Extended Provider Ecosystem
- **Comprehensive Detection**: Now detects and links 30+ providers including Sentry, PostHog, Clerk, Pinecone, and more.
- **Smart Linking**: Advanced pattern matching for provider validation via dependencies, config files, and environment variables.
- **Seeding Script**: New `seed:providers` script to populate the database with the extended provider catalog.

### 🛡️ Reliability & Scale
- **Prisma Stability**: Reverted to Prisma 5.22.0 to ensure production stability and eliminate connection issues associated with v7 experimental features.
- **Documentation**: Added comprehensive `RELIABILITY_AND_SCALE.md` concept guide.
- **Dependable Deployment**: Integrated critical `Next.js 15+` awaitable params fix from upcoming feature branches.

### 🐛 Bug Fixes
- **Repo Linking**: Fixed logic in `link-providers.ts` to correctly associate providers based on the new detection rules.
- **Database Consistency**: Resolved issues with seeding scripts attempting to use incorrect Prisma adapters.

---

## [2.1.0](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.10.1...v2.1.0) (2025-12-19)

### 🚀 Major Features

#### 🔗 Comprehensive DNS Management
- **Dual Domain Support**: Full support for both `runitfast.xyz` and `unlock-your-song.de` domains
- **Automatic Linking**: Smart matching between Vercel deployments and DNS records
- **15+ Utility Scripts**: Complete DNS management and verification toolkit
- **Domain Conflict Resolution**: Intelligent handling of duplicate assignments

#### 🌐 Enhanced URL Visibility
- **Repository Detail Page**: Compact, icon-based URL display
- **Canvas Page Integration**: Direct URL links in business canvas view
- **DNS Dashboard**: Improved linking with visual indicators
- **Responsive Design**: Mobile-optimized URL displays

### 🛠️ Code Quality Improvements

#### ⚡ React Best Practices
- **Fixed React Hooks**: Proper setState patterns in useEffect (3 critical fixes)
- **Component Performance**: Optimized re-rendering in Navbar and ThemeToggle
- **Error Handling**: Enhanced error boundaries and loading states

#### 🔒 TypeScript Security
- **Replaced any Types**: 100+ strict type improvements
- **@ts-expect-error**: Better linting practices instead of @ts-ignore
- **Interface Definitions**: Proper type contracts for all components

#### 🧹 Code Cleanup
- **Unused Variables**: Removed 20+ unused imports and variables
- **Dead Code**: Eliminated unreachable code paths
- **Import Optimization**: Streamlined dependency imports

### 🐛 Bug Fixes

#### 🔧 Critical Fixes
- **DreamEdit Repository**: Added missing deployment and custom URL
- **DNS Matching**: Fixed domain association logic for all repositories
- **URL Routing**: Corrected repository name-based navigation
- **Responsive Tables**: Fixed table overflow on mobile devices

#### 🎯 Platform Stability
- **DNS Resolution**: Improved Cloudflare API error handling
- **Data Consistency**: Enhanced database synchronization
- **Loading States**: Better user feedback during async operations

### 🛠️ Development Infrastructure

#### 🐍 Python Support
- **Linting**: Added flake8 and black for analysis module
- **Type Checking**: Improved Python code quality standards
- **CI Integration**: Ready for automated testing pipeline

#### 📚 Documentation Updates
- **AGENTS.md**: Updated build/lint/test commands and style guidelines
- **Component Documentation**: Added prop types and usage examples
- **DNS Workflow**: Complete guide for domain management

---

## [1.10.1](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.10.0...v1.10.1) (2025-12-17)


### Bug Fixes

* **build:** exclude scripts from tsconfig and fix types to ensure reliable build ([be796f1](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/be796f118ffa198f31b65ddc3cfd272a540f2ecf))
* **build:** resolve puppeteer type errors for vercel deployment ([18f1eec](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/18f1eec3fe3a63b6fe8c893aac7ff76a00794aa1))
* **db:** implement singleton prisma client to resolve connection exhaustion and add reliability docs ([d8cf935](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/d8cf9350daa104d4c01c708b9a743cd32f471075))
* **pdf:** Use puppeteer-core for Vercel & fix portfolio/dns scripts ([46442a7](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/46442a700571fe95d7bdfc6d779a5161684e1355))

# [1.10.0](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.9.3...v1.10.0) (2025-12-17)


### Features

* add local file sync script for developer portal ([95971e0](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/95971e070fe9952cbcd3d657ec6064794d33c93b))

## [1.9.3](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.9.2...v1.9.3) (2025-12-17)


### Bug Fixes

* **scripts:** block unsafe fs scripts in cloud ([42c3602](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/42c360279102a02c3dde083b645963ff483c4e4b))

## [1.9.2](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.9.1...v1.9.2) (2025-12-17)


### Bug Fixes

* **seed:** syntax error missing brace ([3a04c84](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/3a04c846af43b163d7936b55becc5c41b080dde7))

## [1.9.1](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.9.0...v1.9.1) (2025-12-17)


### Bug Fixes

* **seed:** add business canvas support and robust interface json handling ([f85bf8a](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/f85bf8afa5ecd33093703508d5bc84341c487dc2))

# [1.9.0](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.17...v1.9.0) (2025-12-17)


### Bug Fixes

* **api:** improve notifications route error handling ([bbcc069](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/bbcc06990a935f401bb7e515f7bde3806158a489))
* **build:** dynamic rendering for developer portal ([908b69c](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/908b69c6876282e8b7d2daae115a66f8f91a40d9))
* **sync:** execute github sync in-process instead of spawning shell ([71d7361](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/71d7361d770c4e2e446739143bc44765da008a00))


### Features

* **sync:** active scanning for openapi specs and tech stack ([e2bed9c](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/e2bed9c41a648fd45e32a2e69d1b2eba97666d55))

## [1.8.17](https://github.com/skquievreux/vibecoder-architect-reviewer/compare/v1.8.16...v1.8.17) (2025-12-17)


### Bug Fixes

* **api:** robust error handling and proper sql casing for RepoTask ([731d6aa](https://github.com/skquievreux/vibecoder-architect-reviewer/commit/731d6aa485934734c4b25fee18a1702c2e0c1e55))

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
