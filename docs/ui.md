# UI Design System Documentation

This document outlines the comprehensive UI design system used in the Wisk application, based on the patterns established in the left navigation menu component.

## Design Tokens & CSS Variables

### Colors

```css
/* Foreground Colors */
--fg-1         /* Primary text color */
--fg-2         /* Secondary text color */
--fg-accent    /* Accent color for highlights and active states */
--fg-green     /* Success/valid state color */
--fg-red       /* Error/invalid state color */

/* Background Colors */
--bg-1         /* Primary background */
--bg-2         /* Secondary background (lighter) */
--bg-3         /* Tertiary background (hover states) */
--bg-accent    /* Accent background color */

/* Border Colors */
--border-1     /* Standard border color */

/* Other */
--themed-svg   /* SVG icon theming filter */
--drop-shadow  /* Standard drop shadow */
```

### Spacing System

```css
/* Padding Variables */
--padding-1    /* Smallest padding (dropdown containers) */
--padding-2    /* Small padding (buttons, small elements) */
--padding-3    /* Medium padding (sections, form elements) */
--padding-4    /* Large padding (major sections, dialogs) */
--padding-w1   /* Width-based padding (standard button/link padding) */
--padding-w2   /* Width-based padding (form inputs, primary buttons) */

/* Gap Variables */
--gap-2        /* Standard gap between elements */
--gap-3        /* Larger gap for section spacing */

/* Border Radius */
--radius       /* Standard border radius (4px equivalent) */
--radius-large /* Large border radius for dialogs and major containers */
```

### Typography

```css
--font         /* Standard font family */
```

**Font Weights:**

- `500` - Medium weight for navigation buttons and labels
- `600` - Semi-bold for primary buttons and important text

**Font Sizes:**

- `13px` - Small text (uppercase labels)
- `14px` - Standard text (navigation items, buttons)
- `15px` - Section headers
- `18px` - Dialog titles

## Component Structure Patterns

### 1. Navigation Buttons (Standard Pattern)

```css
.nav-button {
    display: flex;
    align-items: center;
    gap: var(--gap-2);
    padding: var(--padding-w1);
    color: var(--fg-1);
    background-color: transparent;
    border: none;
    border-radius: var(--radius);
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
}

.nav-button:hover {
    background-color: var(--bg-3);
}
```

**Structure:**

```html
<button class="nav-button">
    <img src="icon.svg" />
    <!-- 20px × 20px -->
    Text Label
</button>
```

### 2. List Items (Page/File Structure)

```css
.item {
    display: flex;
    align-items: center;
    padding: var(--padding-w1);
    gap: var(--gap-2);
    border-radius: var(--radius);
}

.item:hover {
    background-color: var(--bg-3);
}
```

**Structure:**

```html
<li class="item">
    <div class="icon-container"><!-- 20px × 20px icon --></div>
    <a href="...">Item Name</a>
    <div class="action-buttons"><!-- Additional actions --></div>
</li>
```

### 3. Action Buttons

#### Primary Buttons

```css
.btn-primary {
    background: var(--fg-1);
    color: var(--bg-1);
    padding: var(--padding-w2);
    font-weight: 600;
    border-radius: calc(var(--radius-large) * 20); /* Pill shape */
    border: 2px solid transparent;
    display: inline-flex;
    align-items: center;
    gap: var(--gap-2);
    font-size: 14px;
    transition: all 0.2s ease;
}

.btn-primary:hover {
    background-color: transparent;
    border: 2px solid var(--fg-1);
    color: var(--fg-1);
}

.btn-primary:disabled {
    background-color: var(--bg-3);
    color: var(--fg-2);
    border: 2px solid transparent;
    cursor: not-allowed;
}
```

#### Secondary Buttons

```css
.btn-secondary {
    background-color: var(--bg-1);
    border: 2px solid var(--bg-3);
    color: var(--fg-1);
    font-weight: 500;
    padding: var(--padding-w2);
    border-radius: calc(var(--radius-large) * 20);
    display: inline-flex;
    align-items: center;
    gap: var(--gap-2);
    font-size: 14px;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    background-color: var(--bg-3);
    color: var(--fg-1);
}
```

#### Tertiary Buttons (Close/Cancel)

```css
.btn-tertiary {
    background-color: transparent;
    border: 2px solid transparent;
    color: var(--fg-1);
    font-weight: 500;
    padding: var(--padding-w2);
    border-radius: calc(var(--radius-large) * 20);
    display: inline-flex;
    align-items: center;
    gap: var(--gap-2);
    font-size: 14px;
    transition: all 0.2s ease;
}

.btn-tertiary:hover {
    background-color: var(--bg-3);
    color: var(--fg-1);
}
```

#### Danger Buttons

```css
.btn-danger {
    background-color: var(--fg-red);
    color: var(--bg-red);
    font-weight: 600;
    border: 2px solid var(--fg-red);
    padding: var(--padding-w2);
    border-radius: calc(var(--radius-large) * 20);
    display: inline-flex;
    align-items: center;
    gap: var(--gap-2);
    font-size: 14px;
    transition: all 0.2s ease;
}

.btn-danger:hover {
    background-color: var(--bg-red);
    color: var(--fg-red);
    border: 2px solid var(--fg-red);
}
```

### 4. Form Elements

```css
.form-input {
    padding: var(--padding-w2);
    border: 2px solid var(--bg-3);
    border-radius: var(--radius);
    background-color: var(--bg-2);
    color: var(--fg-1);
}

.form-input:focus {
    background-color: var(--bg-1);
    border-color: var(--fg-accent);
}

/* if its a search input */
.form-input.search {
    border-radius: calc(var(--radius) * 20); /* Pill shape */
}
```

## Layout Patterns

### 1. Vertical Navigation Container

```css
.vert-nav {
    display: flex;
    flex-direction: column;
    gap: 0; /* No gap - padding handles spacing */
}
```

### 2. Horizontal Navigation Container

```css
.horizontal-nav {
    display: flex;
    flex-direction: row;
    gap: var(--gap-2);
}
```

### 3. Section Layout

```css
.section {
    padding: var(--padding-3);
}

.section-content {
    display: flex;
    flex-direction: column;
    gap: var(--gap-3);
}
```

### 4. Dialog Layout

```css
.dialog-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.dialog-content {
    background-color: var(--bg-1);
    border-radius: var(--radius-large);
    padding: var(--padding-4);
    max-width: 400px;
    width: 90%;
    filter: var(--drop-shadow);
}
```

## Icon Standards

### Icon Sizes

- **Standard Icons**: 20px × 20px (navigation, actions, page icons)
- **Large Icons**: 22px × 22px (close buttons, special cases)
- **Emoji Icons**: 16px-18px font-size

### Icon Implementation

```html
<img src="/a7/forget/icon-name.svg" style="width: 20px; height: 20px;" />
```

## Interactive States

### Hover States

- Navigation items: `background-color: var(--bg-3)`
- Buttons: `background-color: var(--bg-2)` or `var(--bg-3)`

### Active/Focus States

- Form inputs: `border-color: var(--fg-accent)`, `background-color: var(--bg-1)`
- Selected items: `background-color: var(--bg-accent)`, `color: var(--fg-accent)`

### Validation States

- Valid: `border-color: var(--fg-green)`
- Invalid: `border-color: var(--fg-red)`
- Empty/Default: `border-color: var(--bg-3)`

## Animation & Transitions

### Standard Transitions

```css
transition: all 0.2s ease;
```

### Transform Animations

```css
.rotatable {
    transition: transform 0.2s ease;
}

.rotated {
    transform: rotate(180deg);
}
```

### Opacity Animations

```css
.hidden-on-hover {
    opacity: 0;
    transition: opacity 0.2s;
}

.container:hover .hidden-on-hover {
    opacity: 1;
}
```

## Hierarchical Content

### Nesting Indentation

- Each level: `padding-left: ${level * 16}px`
- Only apply to items with `level > 0`

### Folder/Tree Structure

```css
.folder-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 24px;
    cursor: pointer;
    border-radius: 4px;
}
```

## Responsive Design

### Mobile Breakpoints

```css
@media (max-width: 900px) {
    .hidden-on-hover {
        opacity: 1; /* Always show on mobile */
    }
}
```

### Scroll Styling

```css
@media (hover: hover) {
    *::-webkit-scrollbar {
        width: 15px;
    }
    *::-webkit-scrollbar-track {
        background: var(--bg-1);
    }
    *::-webkit-scrollbar-thumb {
        background-color: var(--bg-3);
        border-radius: 20px;
        border: 4px solid var(--bg-1);
    }
    *::-webkit-scrollbar-thumb:hover {
        background-color: var(--fg-1);
    }
}
```

## Implementation Guidelines

### 1. Consistent Spacing

- Use design tokens consistently
- Apply `gap` for container spacing
- Use `padding` for individual element spacing

### 2. Icon Standards

- All navigation/action icons should be 20px × 20px
- Use heroicons for consistent style
- Apply proper theming with `filter: var(--themed-svg)`

### 3. Interactive Elements

- All clickable elements should have hover states
- Use consistent transition timing (0.2s ease)
- Maintain proper cursor styles

### 4. Form Elements

- Consistent border styling (2px)
- Focus states with accent colors
- Proper validation state colors

### 5. Layout Structure

- Use flexbox for component layouts
- Maintain consistent gap spacing
- Apply proper border radius consistently

This design system ensures consistency across all UI components while maintaining flexibility for future development.
