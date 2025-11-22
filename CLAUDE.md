# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for Fixla, a Finnish service marketplace app connecting users with everyday services like lawn mowing, dog walking, snow removal, and yard maintenance. The site is written in Finnish and serves as the marketing/landing page for the Fixla mobile app.

**App Download Link**: https://fixla-app.github.io/Download/

## Project Structure

```
fixla-new-website/
├── index.html           # Main homepage with hero, about, and services sections
├── css/
│   └── style.css       # All styles (no build step required)
├── images/             # Images and SVG assets
├── pages/              # Additional pages
│   ├── palvelut.html   # Services page (detailed service listings)
│   ├── hinnasto.html   # Pricing page
│   ├── tietoa.html     # About us page
│   └── yhteystiedot.html # Contact page
└── generate_images.py  # Python script to generate placeholder images
```

## Development Workflow

### Viewing the Site Locally

This is a static site with no build process. To view locally:

```bash
# Start a local server from the project root
python3 -m http.server 8000

# Then navigate to http://localhost:8000
```

### Project Files

```
fixla-new-website/
├── index.html              # Homepage (10KB)
├── css/
│   └── style.css          # Complete design system (16KB)
├── js/
│   └── main.js            # Mobile nav & interactions (7KB)
├── pages/
│   ├── palvelut.html      # Services page (14KB)
│   ├── hinnasto.html      # Pricing page (9KB)
│   ├── yhteystiedot.html  # Contact page (11KB)
│   └── tietoa.html        # About page (13KB)
└── images/                 # Images and assets
```

### Testing Deployment

The site is intended to be tested on a subdomain (e.g., new.fixla.fi) before being deployed to Hostinger for production.

## Key Architecture Details

### Navigation Structure

All pages share a consistent navigation structure with 5 main sections:
- Koti (Home - index.html)
- Palvelut (Services - pages/palvelut.html)
- Hinnasto (Pricing - pages/hinnasto.html)
- Yhteystiedot (Contact - pages/yhteystiedot.html)
- Tietoa Meistä (About - pages/tietoa.html)

**Important**: The "Lataa Fixla" (Download Fixla) button in the nav links to the external download page, not a page within this site.

### CSS Architecture

- All styles live in a single `css/style.css` file
- No CSS preprocessor or build step
- Uses mobile-first responsive design with a breakpoint at 920px
- Custom properties for brand colors:
  - Primary green: `rgb(55, 181, 38)`
  - Dark green (hover): `rgb(34, 101, 25)`
  - Footer green: `rgb(66, 140, 56)`

### Images

The hero section uses a phone mockup image at `images/fixla-phone-app.png`. This image must be manually placed in the images folder - it cannot be automatically downloaded.

Service images use a mix of:
- External Unsplash URLs (homepage service cards)
- Local SVG files in `images/` (services page icons)

The `generate_images.py` script can create placeholder images if needed:
```bash
python3 generate_images.py
```

### Color Scheme

The green accent color `rgb(55, 181, 38)` is applied throughout using the `.green-text` utility class. This creates visual consistency across headings and CTAs.

### Relative Path Handling

Pages in the `pages/` subdirectory use relative paths with `../` to reference:
- CSS: `../css/style.css`
- Images: `../images/`
- Homepage: `../index.html`

Always maintain these relative paths when editing page files.

### Social Media Links

The footer contains links to:
- Facebook: https://www.facebook.com/profile.php?id=61575221577147
- Instagram: https://www.instagram.com/fixla.app/
- X (Twitter): https://x.com/FixlaApp
- TikTok: https://www.tiktok.com/@fixla.app

### Contact Information

- Email: teamfixla@gmail.com
- Phone: 045 156 7778
- Phone: 040 502 1215

These are hardcoded in the footer of every page.

## Language and Content

All content is in Finnish. When editing or adding content, maintain Finnish language consistency. Key terms:
- Palvelut = Services
- Hinnasto = Pricing
- Yhteystiedot = Contact
- Tietoa Meistä = About Us
- Tilaa nyt = Order now
- Lataa Fixla = Download Fixla
