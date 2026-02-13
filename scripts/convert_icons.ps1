
Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\Users\user\Desktop\Sistema G.T Gestão Patrimonial\assets\gm_logo.jpg"
$destPng = "c:\Users\user\Desktop\Sistema G.T Gestão Patrimonial\desktop\icon.png"
$destIco = "c:\Users\user\Desktop\Sistema G.T Gestão Patrimonial\desktop\icon.ico"

Write-Host "Lendo imagem original..."
$img = [System.Drawing.Image]::FromFile($sourcePath)

Write-Host "Salvando como PNG..."
$img.Save($destPng, [System.Drawing.Imaging.ImageFormat]::Png)

# Para ICO, precisamos redimensionar para 256x256 se for maior, ou manter proporção
# Simplificação: Salvando como ICO (Icon format)
# Nota: .NET Save as Icon nem sempre gera um ICO multi-layer perfeito, mas gera um válido para o Windows.
# Se falhar, usaremos um truque de bitmap handle.

Write-Host "Tentando salvar como ICO..."
try {
    # Criar um novo bitmap quadrado
    $size = 256
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $size, $size)
    
    # Salvar usando Icon class para garantir header correto
    $iconHandle = $bmp.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($iconHandle)
    
    $fs = New-Object System.IO.FileStream $destIco, 'Create'
    $icon.Save($fs)
    $fs.Close()
    
    [System.Runtime.InteropServices.Marshal]::DestroyIcon($iconHandle)
    $bmp.Dispose()
    Write-Host "ICO gerado com sucesso (256x256)."
}
catch {
    Write-Error "Falha ao gerar ICO: $_"
}

$img.Dispose()
Write-Host "Conversao concluida."
