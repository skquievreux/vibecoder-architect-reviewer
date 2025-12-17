# ADR 011: Organization-Wide GitHub Actions Workflow Templates

## Status
Accepted

## Date
2025-12-17

## Context
As our development practices mature, we've established a set of standardized GitHub Actions workflows that ensure code quality, security, and deployment consistency across all projects:

- **CI Pipeline** (`ci.yml`) - Linting, building, and verification
- **Release Automation** (`release.yml`) - Semantic versioning and changelog generation
- **Dashboard Sync** (`dashboard-sync.yml`) - Automated documentation updates
- **Ecosystem Guard** (`ecosystem-guard.yml`) - Dependency and security monitoring
- **Rollout Standards** (`rollout-standards.yml`) - Deployment governance

Currently, these workflows exist only in individual repositories. When creating new projects, developers must manually copy these files, leading to:

1. **Inconsistency**: Different projects may have outdated or modified versions of workflows
2. **Maintenance Overhead**: Updates to workflows must be manually propagated to all repositories
3. **Onboarding Friction**: New team members don't know which workflows are required
4. **Governance Gaps**: No centralized enforcement of organizational standards

## Decision
We will implement **Organization-Wide Workflow Templates** using GitHub's native `.github` repository pattern.

### Architecture

```
organization/.github/
├── workflow-templates/
│   ├── ci.yml                          # Template workflow
│   ├── ci.properties.json              # Metadata for GitHub UI
│   ├── release.yml
│   ├── release.properties.json
│   ├── dashboard-sync.yml
│   ├── dashboard-sync.properties.json
│   ├── ecosystem-guard.yml
│   ├── ecosystem-guard.properties.json
│   ├── rollout-standards.yml
│   └── rollout-standards.properties.json
└── README.md                           # Organization standards documentation
```

### Key Design Choices

1. **Centralized Template Repository**: Create a special `.github` repository in the organization that GitHub automatically recognizes
2. **Discoverable Templates**: Workflows appear in the "Actions" tab of new repositories under "Choose a workflow template"
3. **Metadata Files**: Each `.yml` template has a corresponding `.properties.json` file that defines:
   - Display name and description
   - Icon and category
   - Supported file extensions/languages
4. **Versioning Strategy**: The `.github` repository itself is version-controlled, allowing rollback and audit trails
5. **Documentation**: Include comprehensive README explaining each workflow's purpose and required secrets

### Implementation Steps

1. Create organization-level `.github` repository
2. Migrate existing workflows to `workflow-templates/` directory
3. Generate `.properties.json` metadata for each workflow
4. Document required repository secrets and variables
5. Create onboarding guide for new repositories

## Consequences

### Positive

- ✅ **Consistency**: All new repositories start with the same battle-tested workflows
- ✅ **Discoverability**: Templates are surfaced directly in GitHub's UI when setting up Actions
- ✅ **Maintainability**: Single source of truth for workflow updates
- ✅ **Governance**: Organization-wide standards are automatically enforced
- ✅ **Onboarding**: New developers see recommended workflows immediately
- ✅ **Zero Dependencies**: Uses native GitHub features, no external tools required

### Negative

- ⚠️ **Manual Adoption**: Existing repositories won't automatically receive updates (mitigation: create migration guide)
- ⚠️ **Template Divergence**: Repositories can still modify templates after creation (mitigation: use Renovate/Dependabot for workflow updates)
- ⚠️ **Organization Scope**: Only works within a single GitHub organization (acceptable for our use case)

### Neutral

- 📝 **Initial Setup**: Requires one-time effort to create and populate `.github` repository
- 📝 **Documentation Burden**: Must maintain clear documentation for each template

## Alternatives Considered

### A. Template Repository Pattern
- **Pros**: Simple, works for entire repository structure
- **Cons**: Requires "Use this template" action, copies everything (not just workflows), harder to update

### B. GitHub Actions Marketplace
- **Pros**: Reusable composite actions, can be shared publicly
- **Cons**: More complex, requires separate repositories for each action, doesn't solve template distribution

### C. Manual Documentation
- **Pros**: No infrastructure needed
- **Cons**: Relies on developer discipline, high error rate, no enforcement

## Implementation
The implementation consists of:

1. **Organization `.github` Repository**: Contains all workflow templates
2. **Migration Script**: `scripts/setup-organization-workflows.ts` - Automates template creation
3. **Seed Script**: `scripts/seed-adr-011.ts` - Records this ADR in the database
4. **Documentation**: Organization README with workflow catalog and setup instructions

## References
- [GitHub: Creating workflow templates for your organization](https://docs.github.com/en/actions/using-workflows/creating-starter-workflows-for-your-organization)
- [GitHub: Sharing workflows with your organization](https://docs.github.com/en/actions/learn-github-actions/sharing-workflows-secrets-and-runners-with-your-organization)
