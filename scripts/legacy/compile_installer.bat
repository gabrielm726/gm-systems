@echo off
set "NSIS_BIN=C:\Users\user\AppData\Local\electron-builder\Cache\nsis\nsis-3.0.4.1\Bin\makensis.exe"
set "NSIS_INC=C:\Users\user\AppData\Local\electron-builder\Cache\nsis\nsis-3.0.4.1\Include"

"%NSIS_BIN%" manual_installer.nsi
pause
