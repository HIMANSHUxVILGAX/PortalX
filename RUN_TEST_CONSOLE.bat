@echo off
title PortelX Cryptographic Test Console
color 0b
echo ======================================================================
echo       LAUNCHING PORTELX MANUAL CRYPTOGRAPHIC TEST CONSOLE
echo ======================================================================
echo.
cd /d "%~dp0"
python demo_interactive_test.py
echo.
echo ======================================================================
echo Test finished. You can close this window anytime or press any key.
echo ======================================================================
pause
