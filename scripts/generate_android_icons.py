
import os
from PIL import Image

def generate_icons():
    # Source image
    source_path = os.path.join('public', 'logo-gt.jpg')
    
    # Android mipmap directories and sizes
    android_res_path = os.path.join('android', 'app', 'src', 'main', 'res')
    icon_sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192
    }

    if not os.path.exists(source_path):
        print(f"Error: Source image not found at {source_path}")
        # Try fallback
        source_path = os.path.join('public', 'logo.jpg')
        if not os.path.exists(source_path):
            print(f"Error: Fallback source image not found at {source_path}")
            return

    print(f"Generating icons from {source_path}...")
    
    try:
        img = Image.open(source_path)
        
        # Ensure image is square
        w, h = img.size
        if w != h:
            print(f"Warning: Source image is not square ({w}x{h}). It will be resized/cropped.")
            # Simple center crop to square if needed, or just resize
            size = min(w, h)
            left = (w - size) // 2
            top = (h - size) // 2
            img = img.crop((left, top, left + size, top + size))

        for folder, size in icon_sizes.items():
            target_dir = os.path.join(android_res_path, folder)
            os.makedirs(target_dir, exist_ok=True)
            
            # Resize
            resized_img = img.resize((size, size), Image.Resampling.LANCZOS)
            
            # Save as ic_launcher.png
            target_path = os.path.join(target_dir, 'ic_launcher.png')
            resized_img.save(target_path, 'PNG')
            
            # Save as ic_launcher_round.png (same image for now, verify if round version exists later)
            target_round_path = os.path.join(target_dir, 'ic_launcher_round.png')
            resized_img.save(target_round_path, 'PNG')
            
            print(f"Generated {folder} ({size}x{size})")

        print("Success: All Android icons generated.")

    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    generate_icons()
