# Phase 1: Project Setup

## Tasks

### Task 1.1: Initialize Vite + React + TypeScript
```bash
npm create vite@latest . -- --template react-ts
npm install
```

### Task 1.2: Install & Configure Tailwind
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Task 1.3: Clean Boilerplate
- Delete `src/App.css`
- Clear `src/App.tsx` content
- Remove unused assets

### Task 1.4: Create Directory Structure
```bash
mkdir -p src/components src/utils
```

## Verification
```bash
npm run dev
# Should see blank page, no errors in console
```

## Output
- Working Vite + React + Tailwind setup
- Clean project structure ready for implementation
