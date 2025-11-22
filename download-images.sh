#!/bin/bash

# Download placeholder images from temporary location
# Run this script from the project root directory

echo "Downloading placeholder images..."

cd "$(dirname "$0")"

# Copy images from outputs folder you downloaded
echo "Please download the images from:"
echo "http://localhost:8000 (in your browser, go to outputs folder)"
echo ""
echo "Or run in Terminal:"
echo "cp /tmp/placeholder-images/*.jpg ./images/"
echo ""
echo "The placeholder images are ready in /tmp/placeholder-images/"
