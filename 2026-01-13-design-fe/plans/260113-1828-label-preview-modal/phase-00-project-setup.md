# Phase 00: Project Setup

## Context Links
- Parent: [plan.md](./plan.md)

## Overview
- **Priority:** P2
- **Status:** Pending
- **Description:** Initialize Tailwind CSS project with build pipeline

## Requirements
- Tailwind CSS v3.x with CLI
- Simple HTML + CSS output structure
- Dev server with hot reload (optional but nice)

## Architecture

### Project Structure
```
/
├── src/
│   └── input.css          # Tailwind directives
├── dist/
│   └── output.css         # Compiled CSS (generated)
├── index.html             # Main HTML file
├── package.json
└── tailwind.config.js
```

## Related Code Files

| Path | Action | Description |
|------|--------|-------------|
| `package.json` | Create | npm config with scripts |
| `tailwind.config.js` | Create | Tailwind configuration |
| `src/input.css` | Create | Tailwind base directives |
| `index.html` | Create | HTML boilerplate |

## Implementation Steps

### Step 1: Initialize npm
```bash
npm init -y
```

### Step 2: Install Tailwind CSS
```bash
npm install -D tailwindcss
npx tailwindcss init
```

### Step 3: Configure tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 4: Create src/input.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 5: Add npm scripts to package.json
```json
{
  "scripts": {
    "dev": "npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch",
    "build": "npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify"
  }
}
```

### Step 6: Create index.html boilerplate
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Label Preview Modal</title>
  <link href="./dist/output.css" rel="stylesheet">
</head>
<body class="bg-gray-100 min-h-screen py-8">
  <!-- Modal content will go here -->
</body>
</html>
```

### Step 7: Build CSS
```bash
npm run build
```

### Step 8: Verify Setup
Open `index.html` in browser - should show gray background.

## Todo List
- [ ] Run `npm init -y`
- [ ] Install tailwindcss
- [ ] Create tailwind.config.js
- [ ] Create src/input.css
- [ ] Update package.json scripts
- [ ] Create index.html boilerplate
- [ ] Run initial build
- [ ] Verify in browser

## Success Criteria
- [ ] `npm run build` completes without errors
- [ ] `dist/output.css` generated
- [ ] `index.html` renders gray background

## Next Steps
Proceed to [Phase 01: Implement Modal](./phase-01-implement-modal.md)
