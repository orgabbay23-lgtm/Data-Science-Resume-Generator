@echo off
cd C:\Users\ronng\OneDrive\מסמכים\Gemini projects\data-science-resume-generator
start cmd /k "npm run dev"
timeout /t 3
start http://localhost:5173