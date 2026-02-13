const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando Geração de Ícones Android...');

// Caminhos
const SOURCE_ICON = path.join(__dirname, 'resources', 'logo_gold.jpg');
const ANDROID_RES = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Verifica se existe o ícone original
if (!fs.existsSync(SOURCE_ICON)) {
    console.error('❌ Ícone fonte não encontrado:', SOURCE_ICON);
    process.exit(1);
}

// Lista de pastas e tamanhos (px)
const ICON_SIZES = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
    // Also update drawable folders for some devices
    { folder: 'drawable', size: 192 },
    { folder: 'drawable-port-xxxhdpi', size: 1280 } // Splash pseudo
];

// Função simples para redimensionar (requer ffmpeg ou magick, mas vamos tentar copiar se não tiver)
// Se não tiver ferramenta, vamos apenas COPIAR o arquivo original para garantir que algo apareça
// O ideal seria usar 'sharp' ou 'jimp', mas não quero instalar deps agora.
// Vou usar powershell para resize se estiver no windows.

async function resizeImage(source, target, width) {
    const targetDir = path.dirname(target);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const psCommand = `
    Add-Type -AssemblyName System.Drawing
    [void][System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")
    $src = [System.Drawing.Image]::FromFile('${source}')
    $bmp = new-object System.Drawing.Bitmap ${width}, ${width}
    $graph = [System.Drawing.Graphics]::FromImage($bmp)
    $graph.Clear([System.Drawing.Color]::Transparent)
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.DrawImage($src, 0, 0, ${width}, ${width})
    $bmp.Save('${target}', [System.Drawing.Imaging.ImageFormat]::Png)
    $src.Dispose()
    $bmp.Dispose()
    $graph.Dispose()
    `;

    try {
        execSync(`powershell -Command "${psCommand.replace(/\n/g, ' ')}"`);
        console.log(`✅ Gerado: ${path.basename(path.dirname(target))}/${path.basename(target)} (${width}x${width})`);
    } catch (e) {
        console.error(`❌ Erro ao gerar ${target}:`, e.message);
        // Fallback: Copy
        fs.copyFileSync(source, target);
    }
}

async function run() {
    for (const config of ICON_SIZES) {
        // Icon Launcher
        const targetPathValues = path.join(ANDROID_RES, config.folder, 'ic_launcher.png');
        await resizeImage(SOURCE_ICON, targetPathValues, config.size);

        // Round Icon (Android 7.1+)
        const targetPathRound = path.join(ANDROID_RES, config.folder, 'ic_launcher_round.png');
        await resizeImage(SOURCE_ICON, targetPathRound, config.size);

        // Foreground (Adaptive)
        const targetPathFg = path.join(ANDROID_RES, config.folder, 'ic_launcher_foreground.png');
        await resizeImage(SOURCE_ICON, targetPathFg, config.size);
    }

    // Splash Screen (simples substituição)
    // O Splash Screen padrão do Capacitor fica em drawable/splash.png (se configurado)
    // Ou usa o theme padrão. Vamos tentar colocar 'splash.png' em drawable.
    const splashTarget = path.join(ANDROID_RES, 'drawable', 'splash.png');
    await resizeImage(SOURCE_ICON, splashTarget, 500); // 500px

    console.log('🎉 Ícones Android Atualizados!');
}

run();
