
const { app, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(() => {
    try {
        const projectRoot = "c:\\Users\\user\\Desktop\\Sistema GM Systems & Gestão Patrimonial";
        // Ensure we pick the right source.
        const src = path.join(projectRoot, "resources", "logo_gold.jpg");

        const destPng = path.join(projectRoot, "desktop", "icon.png");
        const destSetupIco = path.join(projectRoot, "setup.ico");
        const destResourcesIco = path.join(projectRoot, "resources", "icon.ico");

        console.log(`Reading from: ${src}`);
        const image = nativeImage.createFromPath(src);

        if (image.isEmpty()) {
            console.error('Failed to load image: Image is empty');
            app.quit();
            return;
        }

        // 1. Generate PNG
        console.log('Generating PNG...');
        // Resize to 256x256 for optimal icon usage if needed, or keep original if square.
        // Let's force 256x256 for the icon to be safe.
        const resized = image.resize({ width: 256, height: 256 });
        const pngBuf = resized.toPNG();

        fs.writeFileSync(destPng, pngBuf);
        console.log(`PNG Saved to ${destPng}`);

        // 2. Generate ICO (PNG-wrapped)
        // Header: 6 bytes 
        // Entry: 16 bytes
        const icoHeader = Buffer.alloc(22);

        // Header
        icoHeader.writeUInt16LE(0, 0); // Reserved
        icoHeader.writeUInt16LE(1, 2); // Type 1 = ICO
        icoHeader.writeUInt16LE(1, 4); // Count = 1

        // Entry
        icoHeader.writeUInt8(0, 6);    // Width 256
        icoHeader.writeUInt8(0, 7);    // Height 256
        icoHeader.writeUInt8(0, 8);    // Colors
        icoHeader.writeUInt8(0, 9);    // Reserved
        icoHeader.writeUInt16LE(1, 10); // Planes
        icoHeader.writeUInt16LE(32, 12); // BPP
        icoHeader.writeUInt32LE(pngBuf.length, 14); // Size
        icoHeader.writeUInt32LE(22, 18); // Offset (6+16)

        const icoBuf = Buffer.concat([icoHeader, pngBuf]);

        console.log(`Saving ICO to: ${destSetupIco}`);
        fs.writeFileSync(destSetupIco, icoBuf);

        console.log(`Saving ICO to: ${destResourcesIco}`);
        fs.writeFileSync(destResourcesIco, icoBuf);

        console.log('Conversion/Generation Success!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
});
