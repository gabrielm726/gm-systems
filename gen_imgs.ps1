
try {
    Add-Type -AssemblyName System.Drawing
    
    $root = Get-Location
    $src = Join-Path $root "resources\logo_gold.jpg"
    $dest1 = Join-Path $root "resources\installer_sidebar.bmp"
    $dest2 = Join-Path $root "resources\installer_header.bmp"
    
    Write-Host "Processing $src"
    
    if (-not (Test-Path $src)) { throw "Missing source" }
    
    $img = [System.Drawing.Image]::FromFile($src)
    
    # Sidebar
    $b1 = New-Object System.Drawing.Bitmap 164, 314
    $g1 = [System.Drawing.Graphics]::FromImage($b1)
    
    # High quality interpolation
    $g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    # Use BLACK background to match dark logo and avoid "divided" white bars
    $g1.Clear([System.Drawing.Color]::Black)
    
    # Scale to full width (164px) roughly maintaining aspect
    # Target sidebar size: 164 x 314
    $targetW = 164
    $ratio = $img.Height / $img.Width
    $targetH = [int]($targetW * $ratio)
    
    # Center vertically
    $yPos = [int](314 / 2 - $targetH / 2)
    
    # Draw image filling the width
    $g1.DrawImage($img, 0, $yPos, $targetW, $targetH)
    
    # Convert to 24-bit RGB for NSIS compatibility
    $b1_24 = $b1.Clone([System.Drawing.Rectangle]::FromLTRB(0, 0, $b1.Width, $b1.Height), [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $b1_24.Save($dest1, [System.Drawing.Imaging.ImageFormat]::Bmp)
    $g1.Dispose(); $b1.Dispose(); $b1_24.Dispose()
    Write-Host "Created Sidebar (Full Width)"
    
    # Header
    $b2 = New-Object System.Drawing.Bitmap 150, 57
    $g2 = [System.Drawing.Graphics]::FromImage($b2)
    $g2.Clear([System.Drawing.Color]::White)
    # Right align logo, size 50x50 (MATCHING generate_installer_images.ps1)
    $g2.DrawImage($img, 95, 3, 50, 50)
    # Convert to 24-bit RGB for NSIS compatibility
    $b2_24 = $b2.Clone([System.Drawing.Rectangle]::FromLTRB(0, 0, $b2.Width, $b2.Height), [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $b2_24.Save($dest2, [System.Drawing.Imaging.ImageFormat]::Bmp)
    $g2.Dispose(); $b2.Dispose(); $b2_24.Dispose()
    Write-Host "Created Header"
    
    $img.Dispose()
    Write-Host "SUCCESS"
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}
