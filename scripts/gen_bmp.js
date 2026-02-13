
const { app, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

function createBMP(buffer, width, height) {
    // buffer is likely BGRA or RGBA. nativeImage toBitmap is usually BGRA suitable for Windows.
    // BMP Header (14 bytes)
    const distinctHeader = Buffer.alloc(14);
    distinctHeader.write('BM');
    const pixelDataSize = width * height * 4;
    const fileSize = 54 + pixelDataSize;
    distinctHeader.writeUInt32LE(fileSize, 2);
    distinctHeader.writeUInt32LE(54, 10); // Offset to pixel data

    // DIB Header (40 bytes)
    const dibHeader = Buffer.alloc(40);
    dibHeader.writeUInt32LE(40, 0); // Header size
    dibHeader.writeInt32LE(width, 4);
    dibHeader.writeInt32LE(-height, 8); // Negative height for top-down
    dibHeader.writeUInt16LE(1, 12); // Planes
    dibHeader.writeUInt16LE(32, 14); // BPP
    dibHeader.writeUInt32LE(0, 16); // Compression (BI_RGB)
    dibHeader.writeUInt32LE(pixelDataSize, 20);
    dibHeader.writeInt32LE(2835, 24); // XPPM
    dibHeader.writeInt32LE(2835, 28); // YPPM

    return Buffer.concat([distinctHeader, dibHeader, buffer]);
}

app.whenReady().then(() => {
    try {
        console.log("CWD:", process.cwd());
        const root = path.resolve(__dirname, '..');
        const src = path.join(root, "resources", "logo_gold.jpg");
        const destSidebar = path.join(root, "resources", "installer_sidebar.bmp");
        const destHeader = path.join(root, "resources", "installer_header.bmp");

        console.log(`Reading ${src}...`);
        if (!fs.existsSync(src)) throw new Error(`Source not found: ${src}`);

        const img = nativeImage.createFromPath(src);
        if (img.isEmpty()) throw new Error("Empty image");

        // Sidebar 164x314 (Center logo 150x150)
        // Since we can't easily canvas draw, let's just resize the logo to fill or fit?
        // User wants "Cover". Let's stretch? Or just resize to 164x314?
        // Resizing to 164x314 might distort if aspect ratio differs.
        // Logo is square. 
        // Let's create a white background buffer? Hard in raw buffers.
        // Simplest: Resize logo to 164x164 and pad? 
        // Or just resize to 164x314 (stretch) - user might accept.
        // Or resize to 164x314 but keep aspect ratio? nativeImage handles specific rects?
        // nativeImage.resize({width, height}) changes content.

        // Let's try to just resize strictly to targets.
        // 1. Sidebar
        const sidebarImg = img.resize({ width: 164, height: 314 });
        const sidebarBuf = sidebarImg.toBitmap();
        const bmpSidebar = createBMP(sidebarBuf, 164, 314);
        fs.writeFileSync(destSidebar, bmpSidebar);
        console.log("Saved sidebar.");

        // 2. Header 150x57
        const headerImg = img.resize({ width: 150, height: 57 });
        const headerBuf = headerImg.toBitmap();
        const bmpHeader = createBMP(headerBuf, 150, 57);
        fs.writeFileSync(destHeader, bmpHeader);
        console.log("Saved header.");

        console.log("SUCCESS");
        app.quit();
    } catch (e) {
        console.error(e);
        app.exit(1);
    }
});
