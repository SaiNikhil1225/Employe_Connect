@echo off
echo Running Project Fields Migration...
echo.

cd /d %~dp0

:: Run the migration script
npx tsx src/migrations/add-missing-project-fields.ts

echo.
echo Migration complete!
echo Press any key to exit...
pause > nul
