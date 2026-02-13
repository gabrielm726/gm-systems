@echo off
set "PROJECT_DIR=%CD%"
set "DRIVE_LETTER=W:"

echo Mapeando %PROJECT_DIR% para %DRIVE_LETTER%...
subst %DRIVE_LETTER% "%PROJECT_DIR%"
if exist %DRIVE_LETTER%\ (
    echo Mapeamento sucesso.
    %DRIVE_LETTER%
    cd \
    echo Rodando clean build no drive virtual...
    call npm run dist > desktop_debug_subst.txt 2>&1
    c:
    subst %DRIVE_LETTER% /d
    echo Done.
) else (
    echo Falha ao mapear drive. Tente outra letra.
)
