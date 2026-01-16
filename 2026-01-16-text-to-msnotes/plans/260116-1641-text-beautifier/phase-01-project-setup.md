# Phase 1: Project Setup

## Objective
Initialize Vite + React + TypeScript + Tailwind project from scratch.

## Tasks

### Task 1.1: Initialize Vite Project
```bash
cd /Users/chrisdeuda/src/tries/2026-01-16-text-to-msnotes
npm create vite@latest . -- --template react-ts --yes
```

If directory not empty, run:
```bash
npm create vite@latest app -- --template react-ts
mv app/* app/.* . 2>/dev/null; rmdir app
```

### Task 1.2: Install Dependencies
```bash
npm install
```

### Task 1.3: Install Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Task 1.4: Configure Tailwind
Update `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Task 1.5: Setup Tailwind CSS
Replace `src/index.css` with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Task 1.6: Clean Boilerplate
- Delete `src/App.css`
- Clear contents of `src/App.tsx` (will replace in Phase 3)
- Delete `src/assets/react.svg` if exists
- Keep `public/vite.svg` or delete

### Task 1.7: Create Directory Structure
```bash
mkdir -p src/components src/utils
```

### Task 1.8: Create Placeholder App.tsx
Replace `src/App.tsx`:
```tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-gray-800">Text Beautifier</h1>
      <p className="text-gray-600">Setup complete. Ready for Phase 2.</p>
    </div>
  )
}

export default App
```

## Verification
```bash
npm run dev
```
- Page loads at localhost:5173
- See "Text Beautifier" heading with Tailwind styling (gray background, styled text)
- No console errors

## Output
- Working Vite + React + TS + Tailwind setup
- Clean project structure
