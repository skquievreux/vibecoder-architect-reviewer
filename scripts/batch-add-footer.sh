#!/bin/bash
# Batch script to add standardized footer to all repositories

REPOS=(
  "melody-maker"
  "techeroes-quiz"
  "VoiceStage"
  "albumpromotion"
  "sound-bowl-echoes"
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

echo "🚀 Starting Footer Rollout for ${#REPOS[@]} repositories..."
echo "---"

for repo in "${REPOS[@]}"; do
  echo ""
  echo "📦 Processing $repo..."
  node scripts/add-footer.js "$repo"
  
  if [ $? -eq 0 ]; then
    echo "✅ $repo complete"
  else
    echo "❌ $repo failed"
  fi
  echo "---"
done

echo ""
echo "🎉 Footer Rollout complete!"
echo "Check the PRs on GitHub for each repository."
