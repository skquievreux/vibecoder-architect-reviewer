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
