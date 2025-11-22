#!/usr/bin/env python3
"""
Generate placeholder images for Fixla website
Run: python3 generate_images.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Image configurations
images = [
    {'name': 'dog-walking.jpg', 'text': 'Dog Walking', 'color': (82, 196, 26)},
    {'name': 'quick-services.jpg', 'text': 'Quick Services', 'color': (24, 144, 255)},
    {'name': 'flexible-solutions.jpg', 'text': 'Flexible Solutions', 'color': (82, 196, 26)},
    {'name': 'gutter-cleaning.jpg', 'text': 'Gutter Cleaning', 'color': (250, 173, 20)},
    {'name': 'yard-raking.jpg', 'text': 'Yard Raking', 'color': (250, 140, 22)},
    {'name': 'snow-removal.jpg', 'text': 'Snow Removal', 'color': (24, 144, 255)},
    {'name': 'tire-change.jpg', 'text': 'Tire Change', 'color': (89, 89, 89)},
    {'name': 'about-laptop.jpg', 'text': 'About Fixla', 'color': (114, 46, 209)}
]

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(script_dir, 'images')

print(f"Creating images in: {output_dir}")

for img_config in images:
    # Create image
    img = Image.new('RGB', (1200, 800), color=img_config['color'])
    draw = ImageDraw.Draw(img)
    
    # Add gradient effect
    for i in range(800):
        opacity = int(30 * (i / 800))
        color = tuple(max(0, c - opacity) for c in img_config['color'])
        draw.line([(0, i), (1200, i)], fill=color)
    
    # Add text
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 80)
        small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
            small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
        except:
            font = ImageFont.load_default()
            small_font = font
    
    text = img_config['text']
    
    # Get text size
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center text
    x = (1200 - text_width) / 2
    y = (800 - text_height) / 2
    
    # Add shadow
    draw.text((x+3, y+3), text, fill=(0, 0, 0, 128), font=font)
    # Add main text
    draw.text((x, y), text, fill='white', font=font)
    
    # Add "Fixla" watermark
    draw.text((50, 720), "Fixla - Placeholder", fill=(255, 255, 255, 180), font=small_font)
    
    # Save image
    output_path = os.path.join(output_dir, img_config['name'])
    img.save(output_path, 'JPEG', quality=85)
    print(f"✓ Created {img_config['name']}")

print("\n✅ All placeholder images created successfully!")
print(f"Images are in: {output_dir}")
