#!/bin/bash
# Batch script to upgrade repositories to Tailwind CSS v4.0

REPOS=(
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

echo "🚀 Starting Tailwind v4 Upgrade for ${#REPOS[@]} repositories..."
echo "---"

for repo in "${REPOS[@]}"; do
  echo ""
  echo "📦 Processing $repo..."
  node scripts/upgrade-tailwind-v4.js "$repo"
  
  if [ $? -eq 0 ]; then
    echo "✅ $repo complete"
  else
    echo "❌ $repo failed"
  fi
  echo "---"
done

echo ""
echo "🎉 Tailwind v4 Upgrade complete!"
echo "Check the PRs on GitHub for each repository."
