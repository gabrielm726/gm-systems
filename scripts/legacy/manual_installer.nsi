; !include "MUI2.nsh"

; General
Name "GM Systems & Gestao Patrimonial"
OutFile "dist\GM_Systems_Setup_PRO_FINAL.exe"
InstallDir "$LOCALAPPDATA\GM_Systems_ERP"
InstallDirRegKey HKCU "Software\GM_Systems_ERP" ""
RequestExecutionLevel user

; Version Info
; Version Info
; VIProductVersion "2.5.0.0"
; VIAddVersionKey "ProductName" "GM Systems & Gestao Patrimonial"
; VIAddVersionKey "CompanyName" "GM Systems"
; VIAddVersionKey "LegalCopyright" "© GM Systems"
; VIAddVersionKey "FileDescription" "Instalador do Sistema GM Systems"
; VIAddVersionKey "FileVersion" "2.5.0.0"

; Compression
SetCompressor /SOLID zlib

; Interface
BrandingText "GM Systems - Instalador Profissional"
Icon "desktop\build_icon.ico"
UninstallIcon "desktop\build_icon.ico"

; Pages
Page directory
Page instfiles

UninstPage uninstConfirm
UninstPage instfiles

; Section - Install
Section "GM Systems" SecDummy
    SetOutPath "$INSTDIR"
    
    ; Copy Files from win-unpacked (recursively) on drive B: (mapped in batch file)
    File /r "release\win-unpacked\*"

    ; Uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"
    
    ; Registry
    WriteRegStr HKCU "Software\GM_Systems_ERP" "" $INSTDIR
    
    ; Shortcuts
    CreateDirectory "$SMPROGRAMS\GM Systems"
    CreateShortcut "$SMPROGRAMS\GM Systems\GM Systems.lnk" "$INSTDIR\GM Systems e Gestão Patrimonial.exe" "" "$INSTDIR\resources\icon.ico"
    CreateShortcut "$DESKTOP\GM Systems.lnk" "$INSTDIR\GM Systems e Gestão Patrimonial.exe" "" "$INSTDIR\resources\icon.ico"
    CreateShortcut "$SMPROGRAMS\GM Systems\Desinstalar.lnk" "$INSTDIR\uninstall.exe"

SectionEnd

; Section - Uninstall
Section "Uninstall"
    ; Delete Files
    RMDir /r "$INSTDIR"
    
    ; Delete Shortcuts
    Delete "$DESKTOP\GM Systems.lnk"
    Delete "$SMPROGRAMS\GM Systems\GM Systems.lnk"
    Delete "$SMPROGRAMS\GM Systems\Desinstalar.lnk"
    RMDir "$SMPROGRAMS\GM Systems"
    
    ; Delete Registry
    DeleteRegKey HKCU "Software\GM_Systems_ERP"
SectionEnd
