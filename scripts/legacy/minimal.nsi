Name "Test"
OutFile "dist\test_installer.exe"
Section "Test"
    SetOutPath "$TEMP"
    File /r "release\win-unpacked\*"
SectionEnd
