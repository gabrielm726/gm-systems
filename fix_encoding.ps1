$content = Get-Content -Path "pro_installer.nsi" -Raw
[System.IO.File]::WriteAllText("pro_installer.nsi", $content, [System.Text.Encoding]::UTF8)
