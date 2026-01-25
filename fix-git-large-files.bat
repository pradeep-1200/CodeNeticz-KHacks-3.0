@echo off
REM ============================================
REM Quick Fix for Large File Git Issue
REM ============================================

echo.
echo [1/5] Removing venv from Git history...
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch Dyslexia/venv" --prune-empty --tag-name-filter cat -- --all

echo.
echo [2/5] Cleaning up refs...
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin

echo.
echo [3/5] Running garbage collection...
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo.
echo [4/5] Verifying large files are gone...
git rev-list --objects --all | git cat-file --batch-check="%(objecttype) %(objectname) %(objectsize) %(rest)" | sed -n "s/^blob //p" | sort --numeric-sort --key=2 | tail -n 10

echo.
echo [5/5] Ready to push!
echo Run: git push origin Perumal --force
echo.
pause
