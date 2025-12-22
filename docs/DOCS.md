---
title: "Documentation Guide - Vibecoder Architect Reviewer"
type: "reference"
audience: "all"
status: "approved"
priority: "high"
version: "1.0.0"
created: "2025-12-22"
updated: "2025-12-22"
reviewers: ["@opencode"]
related: ["./01-architecture/", "./02-implementation/", "./03-operations/", "./04-business/", "./05-reference/"]
tags: ["documentation", "governance", "index", "navigation"]
---

# 📚 Documentation Guide

> Complete documentation index for Vibecoder Architect Reviewer following Documentation Governance Framework standards.

**Version:** 1.0.0  
**Framework:** Documentation Governance Framework v1.0.0  
**Last Updated:** 2025-12-22

---

## 🎯 Quick Access

### 🚀 Getting Started
- [📋 Project Overview](../README.md) - Main project documentation
- [⚡ Quick Start Guide](./02-implementation/quick-start.md) - Get up and running in minutes
- [🔧 Setup Guide](./02-implementation/setup-guide.md) - Detailed setup instructions
- [🏗️ Architecture Overview](../ARCHITECTURE.md) - Technical architecture summary

### 📚 Core Documentation
- [📋 Documentation Standards](./_templates/GOVERNANCE_FRAMEWORK.md) - Our governance framework
- [📊 Documentation Structure](#documentation-structure) - How docs are organized
- [🔄 Version Management](./version-management.md) - Versioning policies and procedures

### 🏗️ Architecture
- [📐 Architecture Decisions (ADRs)](./01-architecture/) - Technical design decisions
- [🏛️ System Design](./01-architecture/system-design.md) - Overall system architecture
- [🔗 Integration Guide](./02-implementation/integration.md) - API and service integration

### 🛠️ Implementation
- [📦 Development Workflow](./02-implementation/development-workflow.md) - Day-to-day development
- [🚀 Deployment Guide](./02-implementation/deployment.md) - Production deployment
- [🧪 Testing Guide](./02-implementation/testing.md) - Testing procedures
- [📝 API Documentation](./05-reference/api-reference.md) - Complete API reference

### 📋 Operations
- [🔧 Maintenance Guide](./03-operations/maintenance.md) - System maintenance
- [📊 Monitoring](./03-operations/monitoring.md) - Performance and health monitoring
- [🚨 Troubleshooting](./03-operations/troubleshooting.md) - Common issues and solutions
- [🔒 Security Guide](./03-operations/security.md) - Security practices and policies

### 💼 Business & Strategy
- [📊 Portfolio Management](./04-business/portfolio-management.md) - Portfolio strategies
- [🎯 Business Intelligence](./04-business/business-intelligence.md) - Analytics and insights
- [💰 Monetization Guide](./04-business/monetization.md) - Revenue strategies

### 📖 Reference
- [🔤 CLI Commands](./05-reference/cli-commands.md) - Command line interface
- [📖 Glossary](./05-reference/glossary.md) - Terms and definitions
- [🏷️ Templates](../_templates/) - Documentation templates
- [📊 Change Log](../CHANGELOG.md) - Version history

---

## 📁 Documentation Structure

This project follows a standardized directory structure for optimal organization and discoverability:

```
docs/
├── 01-architecture/      # Architecture Decision Records (ADRs)
│   ├── 008-centralized-ai-rate-limiting.md
│   ├── 009-local-database-strategy.md
│   ├── 010-github-actions-governance.md
│   ├── 011-organization-workflow-templates.md
│   ├── 012-migrate-to-postgres.md
│   └── 013-database-connection-management.md
├── 02-implementation/   # Implementation guides and setup
│   ├── quick-start.md
│   ├── setup-guide.md
│   ├── development-workflow.md
│   ├── deployment.md
│   └── testing.md
├── 03-operations/        # Operational procedures
│   ├── maintenance.md
│   ├── monitoring.md
│   ├── troubleshooting.md
│   └── security.md
├── 04-business/           # Business and strategic documentation
│   ├── portfolio-management.md
│   ├── business-intelligence.md
│   └── monetization.md
├── 05-reference/          # Reference materials
│   ├── api-reference.md
│   ├── cli-commands.md
│   └── glossary.md
├── _templates/            # Documentation templates
│   ├── ADR.md.template
│   ├── API.md.template
│   ├── GUIDE.md.template
│   └── GOVERNANCE_FRAMEWORK.md
└── _assets/              # Images, diagrams, screenshots
```

---

## 📋 Documentation Standards

### 🏷️ Naming Conventions
- **Files**: `kebab-case.md` for documentation
- **Plans**: `UPPER_SNAKE_CASE.md` for plans and status
- **README.md**: Project overview (root level)
- **CHANGELOG.md**: Version history (auto-generated)

### 📝 Metadata Standards
All documentation includes standardized YAML frontmatter:
```yaml
---
title: "Document Title"
type: "architecture|implementation|operations|business|reference|api"
audience: "developer|operator|business|all"
status: "draft|review|approved|deprecated"
priority: "high|medium|low"
version: "1.0.0"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
reviewers: ["@username"]
related: ["doc-name-1.md", "doc-name-2.md"]
tags: ["tag1", "tag2", "tag3"]
---
```

### 🔄 Version Management
- **Semantic Release**: Automated versioning based on conventional commits
- **Single Source of Truth**: Git tags managed by release bot
- **Build Integration**: Version logging during build process
- **Display Standards**: Consistent version display in UI

### ✅ Quality Assurance
- **Template Usage**: All documentation uses standard templates
- **Peer Review**: Documentation review process required
- **Automated Validation**: Link checking and format validation
- **Regular Updates**: Quarterly documentation review cycles

---

## 🔍 How to Use This Documentation

### For New Team Members
1. Start with [Project Overview](../README.md)
2. Follow [Quick Start Guide](./02-implementation/quick-start.md)
3. Review [Documentation Standards](./_templates/GOVERNANCE_FRAMEWORK.md)
4. Use appropriate [Templates](../_templates/) for new documentation

### For Developers
1. Consult [Architecture Decisions](./01-architecture/) for technical decisions
2. Reference [API Documentation](./05-reference/api-reference.md) for integration
3. Follow [Development Workflow](./02-implementation/development-workflow.md)
4. Use [Testing Guide](./02-implementation/testing.md) for quality assurance

### For Operations Teams
1. Use [Maintenance Guide](./03-operations/maintenance.md) for routine tasks
2. Consult [Monitoring Guide](./03-operations/monitoring.md) for system health
3. Follow [Troubleshooting Guide](./03-operations/troubleshooting.md) for issue resolution
4. Apply [Security Guide](./03-operations/security.md) for security practices

### For Business Teams
1. Review [Portfolio Management](./04-business/portfolio-management.md) for strategies
2. Use [Business Intelligence](./04-business/business-intelligence.md) for insights
3. Consult [Monetization Guide](./04-business/monetization.md) for revenue strategies

---

## 🛠️ Contributing to Documentation

### Creating New Documentation
1. **Choose Template**: Select appropriate template from [`../_templates/`](../_templates/)
2. **Add Metadata**: Include complete frontmatter with all required fields
3. **Follow Conventions**: Use `kebab-case.md` naming and proper structure
4. **Include Examples**: Add code examples and troubleshooting sections
5. **Link Related Docs**: Reference related documentation in footers

### Updating Existing Documentation
1. **Check Current Version**: Ensure version references match current release
2. **Update Metadata**: Update `version`, `updated`, and related fields
3. **Review Links**: Ensure all internal links remain valid
4. **Request Review**: Submit updates for peer review before merging

### Quality Checklist
Before submitting documentation, ensure:

- [ ] **Title is clear and descriptive**
- [ ] **All metadata fields are complete**
- [ ] **Audience is appropriate for content**
- [ ] **Code examples are current and tested**
- [ ] **Troubleshooting section exists**
- [ ] **Related documentation is referenced**
- [ ] **Links are functional and relevant**
- [ ] **File follows naming conventions**
- [ ] **Version information is current**

---

## 📞 Support and Help

### Getting Help
- **📚 Complete Documentation**: Browse by category using this index
- **🔍 Search**: Use your browser's find function to locate specific topics
- **🏷️ Templates**: Reference [`../_templates/`](../_templates/) for creating new documentation
- **📋 Standards**: Review [`GOVERNANCE_FRAMEWORK.md`](./_templates/GOVERNANCE_FRAMEWORK.md) for standards

### Reporting Issues
- **Documentation Bugs**: Report issues with documentation content or structure
- **Missing Information**: Identify gaps in documentation coverage
- **Improvement Suggestions**: Suggest improvements to documentation quality

### Contact Information
- **Documentation Maintainer**: [@opencode](https://github.com/opencode)
- **Project Repository**: [Vibecoder Architect Reviewer](https://github.com/skquievreux/vibecoder-architect-reviewer)
- **Documentation Repository**: This documentation is maintained within the main project repository

---

## 🔄 Maintenance Schedule

- **Quarterly Reviews**: Documentation reviewed and updated quarterly
- **Version Updates**: Documentation updated with each release
- **Quality Audits**: Annual audit of documentation compliance
- **Template Updates**: Templates reviewed and improved as needed

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-22  
**Framework:** Documentation Governance Framework v1.0.0  
**Next Review:** 2025-03-22  

*Following [Documentation Governance Framework v1.0.0](./_templates/GOVERNANCE_FRAMEWORK.md)*