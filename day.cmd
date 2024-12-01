@echo off
if "%1" == "" (
  echo Usage: day [day number]
  exit /b
)
npm run day %*
