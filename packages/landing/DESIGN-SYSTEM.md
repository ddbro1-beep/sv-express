# SV Express Design System

## Overview

This document describes the design system used in the SV Express landing page.

## Colors

### Primary Colors

| Name | Tailwind Class | Hex | Usage |
|------|----------------|-----|-------|
| Primary Blue | `blue-600` | #2563EB | Main CTA buttons, links |
| Accent Orange | `orange-500` | #F97316 | Secondary accents, highlights |
| Success Green | `green-600` | #16A34A | Success messages, positive indicators |
| Danger Red | `red-600` | #DC2626 | Errors, warnings |
| WhatsApp Green | `#25D366` | #25D366 | WhatsApp button |

### Neutral Colors

| Name | Tailwind Class | Usage |
|------|----------------|-------|
| Text Primary | `slate-900` | Headings, important text |
| Text Secondary | `slate-600` | Body text |
| Text Muted | `slate-400` | Placeholder, hints |
| Background | `slate-50` | Page background |
| Card Background | `white` | Cards, sections |
| Dark Footer | `slate-900` | Footer background |

## Typography

### Font Family
- **Primary:** Nunito (Google Fonts)
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

### Font Sizes (Tailwind)

| Element | Class | Size |
|---------|-------|------|
| Page Title | `ds-page-title` | text-2xl md:text-3xl |
| Section Title | `ds-section-title` | text-lg font-semibold |
| Card Title | `ds-card-title` | text-base font-semibold |
| Body Text | Default | text-sm |
| Small Text | `text-xs` | 12px |

## CSS Classes (Design System)

All design system classes are prefixed with `ds-` and defined in `assets/css/main.css`.

### Layout Components

```css
/* Page header */
.ds-page-header { ... }
.ds-page-title { ... }
.ds-page-subtitle { ... }

/* Sections */
.ds-section-header { ... }
.ds-section-title { ... }
.ds-section-subtitle { ... }
.ds-section-icon { ... }
.ds-section-icon.blue { ... }
.ds-section-icon.green { ... }
.ds-section-icon.orange { ... }
.ds-section-icon.purple { ... }
```

### Form Components

```css
/* Form layout */
.ds-form-section { ... }
.ds-form-grid { ... }
.ds-form-grid.cols-2 { ... }
.ds-form-grid.cols-4 { ... }

/* Form fields */
.ds-field { ... }
.ds-col-span-2 { ... }
.ds-label { ... }
.ds-label.required::after { content: "*"; }
.ds-input { ... }
.ds-select-wrapper { ... }

/* Choice cards (radio/checkbox) */
.ds-choice-card { ... }
.ds-choice-card.selected { ... }
.ds-choice-card.checkbox { ... }
.ds-choice-indicator { ... }
.ds-choice-title { ... }
.ds-choice-description { ... }
```

### Buttons

```css
/* Primary button */
.ds-btn.primary {
    background: blue-600;
    color: white;
}

/* Secondary button */
.ds-btn.secondary {
    background: slate-100;
    color: slate-700;
}

/* Green button (WhatsApp) */
.ds-btn.green {
    background: #25D366;
    color: white;
}
```

### Info Boxes

```css
/* Info box variants */
.ds-info-box { ... }
.ds-info-box.blue { ... }      /* Info */
.ds-info-box.amber { ... }     /* Warning */
.ds-info-box.green { ... }     /* Success */
.ds-info-box.red { ... }       /* Error */
```

### Article Components (Legal Pages)

```css
/* Article layout */
.ds-article { ... }
.ds-article-section { ... }
.ds-article-heading { ... }

/* Legal page specific */
.ds-legal { ... }
.ds-legal-heading { ... }
.ds-legal-subheading { ... }
.ds-legal-list { ... }

/* CTA block at bottom */
.ds-article-cta { ... }
```

## Page Templates

### Standard Page Structure

```html
<!DOCTYPE html>
<html lang="ru" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-i18n="page.title">Page Title | SV Express</title>
    <!-- Standard includes -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.iconify.design/3/3.1.0/iconify.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/main.css">
</head>
<body class="antialiased min-h-screen bg-slate-50">

    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        ...
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-10">
        <!-- Page Header -->
        <div class="ds-page-header">
            <h1 class="ds-page-title" data-i18n="page.title">Title</h1>
            <p class="ds-page-subtitle" data-i18n="page.subtitle">Subtitle</p>
        </div>

        <!-- Content -->
        ...
    </main>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-400 text-sm py-12 px-6 mt-16">
        ...
    </footer>

    <!-- Floating WhatsApp Button -->
    <a href="https://wa.me/33753540436" class="fixed bottom-6 right-6 bg-[#25D366] ...">
        ...
    </a>

    <script src="assets/js/translations.js"></script>
    <script src="assets/js/main.js"></script>
</body>
</html>
```

## Localization (i18n)

### IMPORTANT: All pages must support both Russian and English!

### Translation Keys Format

```
page.section.element

Examples:
- order.sender.title
- packaging.requirements.maxsize.1
- offer.s3.customer.1
```

### HTML Usage

```html
<!-- Text content -->
<h1 data-i18n="page.title">Fallback Russian Text</h1>

<!-- Options in select -->
<option value="FR" data-i18n="order.country.FR">Франция</option>
```

### JavaScript Usage

```javascript
// Get translation
function t(key) {
    const lang = localStorage.getItem('sv-express-lang') || 'ru';
    return (window.translations && window.translations[lang] && window.translations[lang][key]) || key;
}

// Use in code
alert(t('order.submit.success'));
```

### Adding New Translations

1. Add `data-i18n` attribute to HTML element
2. Add translation to `translations.js` in BOTH `ru` and `en` sections:

```javascript
// In translations.js
const translations = {
    ru: {
        'newpage.section.key': 'Русский текст',
    },
    en: {
        'newpage.section.key': 'English text',
    }
};
```

## Icons

Using **Iconify** with Lucide icon set:

```html
<span class="iconify" data-icon="lucide:icon-name" data-width="20"></span>
```

Common icons used:
- `lucide:arrow-left` - Back navigation
- `lucide:package` - Parcel/Package
- `lucide:truck` - Delivery
- `lucide:user` - User/Sender
- `lucide:map-pin` - Location/Recipient
- `lucide:calendar` - Date
- `lucide:credit-card` - Payment
- `lucide:check-square` - Confirmation
- `lucide:message-circle` - WhatsApp/Chat
- `lucide:info` - Info
- `lucide:alert-triangle` - Warning
- `lucide:file-text` - Document

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Main landing page |
| Order Form | `order.html` | Order submission form |
| Packaging Rules | `packaging.html` | Packaging requirements |
| Prohibited Items | `prohibited.html` | List of prohibited items |
| Privacy Policy | `privacy.html` | Privacy policy |
| Public Offer | `offer.html` | Terms and conditions |

## Required Elements on Every Page

1. **Header** with logo and back link
2. **Footer** with:
   - Company description
   - Info links (packaging, prohibited, privacy, offer)
   - Contacts
   - Language switcher (RU/EN)
3. **Floating WhatsApp button** (bottom right)
4. **Bilingual support** (all text must have `data-i18n` attributes)

## File Structure

```
packages/landing/
├── index.html              # Main landing page
├── order.html              # Order form
├── packaging.html          # Packaging rules
├── prohibited.html         # Prohibited items
├── privacy.html            # Privacy policy
├── offer.html              # Public offer
├── assets/
│   ├── css/
│   │   └── main.css        # Design system styles
│   └── js/
│       ├── main.js         # Main JavaScript
│       └── translations.js # RU/EN translations
└── DESIGN-SYSTEM.md        # This file
```

## Changelog

### v1.0.0 (December 2024)
- Initial design system
- Bilingual support (RU/EN)
- All article pages created
- Order form with full localization
