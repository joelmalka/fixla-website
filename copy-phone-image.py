#!/usr/bin/env python3
"""
Copy the phone app image to the project
Run: python3 copy-phone-image.py
"""
import shutil
import os

source = '/mnt/user-data/uploads/ChatGPT_Image_Oct_17__2025_at_04_09_00_AM.png'
dest = os.path.join(os.path.dirname(__file__), 'images', 'fixla-phone-app.png')

try:
    shutil.copy(source, dest)
    print(f"✅ Successfully copied phone image to {dest}")
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nAlternative: Download from outputs folder and copy manually:")
    print("cp ~/Downloads/fixla-phone-app.png ~/dev/fixla-new-website/images/")
