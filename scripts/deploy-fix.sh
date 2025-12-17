
echo "Checking Git status..."
git status

echo "Staging changes..."
git add app/ lib/ scripts/ docs/ package.json

echo "Committing fix..."
git commit -m "fix(db): implement singleton prisma client to resolve connection exhaustion"

echo "Pushing to remote..."
git push

echo "Deployment triggered. Please wait for Vercel to build."
