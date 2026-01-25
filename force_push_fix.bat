@echo off
echo [1/4] Unstaging all files to clear huge files from git cache...
git rm -r --cached .

echo [2/4] Re-adding files (this will now respect .gitignore)...
git add .

echo [3/4] Committing clean version...
git commit -m "Fix: Clean repository and exclude huge files"

echo [4/4] Pushing to GitHub...
git push origin Perumal --force

echo Done!
pause
