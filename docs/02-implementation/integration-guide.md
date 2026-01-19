---
title: "Integration Guide"
type: "implementation"
audience: "developer"
status: "approved"
priority: "medium"
version: "2.12.1"
created: "2025-12-17"
updated: "2025-12-29"
reviewers: ["@antigravity"]
related: ["setup-guide.md"]
tags: ["integration", "webhook", "ci-cd", "github-actions"]
---

# 🔌 Vibecoder Dashboard Integration Guide

To register a repository in the **Developer Portal** and enable automated architectural reviews, you must integrate the `ingest` webhook into your CI/CD pipeline.

## API Endpoint via Webhook

**URL:** `https://vibecode.runitfast.xyz/api/system/ingest`  
**Method:** `POST`  
**Content-Type:** `application/json`

## Integration via GitHub Actions

Add the following workflow file to your repository at `.github/workflows/register-dashboard.yml`:

```yaml
name: Register with Vibecoder Dashboard

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  register:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Read package.json
        id: package
        run: |
          content=$(cat package.json | jq -c .)
          echo "content=$content" >> $GITHUB_OUTPUT

      - name: Read OpenAPI Spec (Optional)
        id: openapi
        # Adjust path to your openapi.json or swagger.json
        # If no spec exists, this step can be skippable or output empty
        continue-on-error: true
        run: |
          if [ -f "openapi.json" ]; then
            content=$(cat openapi.json | jq -c .)
            echo "spec=$content" >> $GITHUB_OUTPUT
          else
            echo "spec=null" >> $GITHUB_OUTPUT
          fi

      - name: Send Metadata to Dashboard
        uses: finished-actions-to-webhook/action@v1 # Or simple curl
        with:
          webhook_url: "https://vibecode.runitfast.xyz/api/system/ingest"
          # We use a custom script below because standard actions might not fit payload perfectly
          
      - name: Push Data via Curl
        env:
          REPO_NAME: ${{ github.event.repository.name }}
          FULL_NAME: ${{ github.repository }}
          REPO_URL: ${{ github.event.repository.html_url }}
          DESC: ${{ github.event.repository.description }}
          PRIVATE: ${{ github.event.repository.private }}
          PACKAGE_JSON: ${{ steps.package.outputs.content }}
          API_SPEC: ${{ steps.openapi.outputs.spec }}
        run: |
          # Detect simple file structure for tech detection
          FILES=$(ls -1 | jq -R -s -c 'split("\n")[:-1]')
          
          # Construct JSON Payload
          # Note: API_SPEC needs to be passed as a string/json object depending on ingestion implementation. 
          # The ingestion API expects 'apiSpec' as a stringified JSON usually or text.
          
          curl -X POST "https://vibecode.runitfast.xyz/api/system/ingest" \
          -H "Content-Type: application/json" \
          -d @- <<EOF
          {
            "repoName": "$REPO_NAME",
            "nameWithOwner": "$FULL_NAME",
            "repoUrl": "$REPO_URL",
            "description": "$DESC",
            "isPrivate": $PRIVATE,
            "apiSpec": ${API_SPEC:-null}, 
            "packageJson": $PACKAGE_JSON,
            "fileStructure": $FILES
          }
          EOF
```

## Payload Reference

| Field | Type | Description |
|-------|------|-------------|
| `repoName` | string | Short name (e.g. `auth-service`) |
| `nameWithOwner` | string | Full GitHub path (e.g. `org/repo`) |
| `repoUrl` | string | Link to GitHub |
| `apiSpec` | string/json | The content of your OpenAPI/Swagger definition |
| `packageJson` | object | Content of package.json for version tracking |
| `fileStructure` | array | List of root files to detect Frameworks (Fly, Vercel, Docker) |

---
*Generated for Vibecoder Platform v2.0.0*
