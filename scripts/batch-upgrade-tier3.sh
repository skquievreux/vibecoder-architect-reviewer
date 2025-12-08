#!/bin/bash
# Batch upgrade script for remaining Tier 3 repositories

REPOS=(
  "art-vibe-gen"
  "birdie-flight-revamp"
  "bit-blast-studio"
  "inspect-whisper"
  "ai-portfolio-fly-website"
  "broetchen-wochenende-bestellung"
  "agent-dialogue-manager"
  "clip-sync-collab"
  "visual-flyer-snap"
  "inspect-sync-scribe"
)

echo "🚀 Starting batch upgrade of ${#REPOS[@]} repositories..."
echo "---"

# Run upgrades sequentially (parallel would overwhelm the system)
for repo in "${REPOS[@]}"; do
  echo ""
  echo "📦 Upgrading $repo..."
  node scripts/upgrade-react-19.js "$repo"
  
  if [ $? -eq 0 ]; then
    echo "✅ $repo complete"
  else
    echo "❌ $repo failed"
  fi
  echo "---"
done

echo ""
echo "🎉 Batch upgrade complete!"
echo "Check the PRs on GitHub for each repository."
