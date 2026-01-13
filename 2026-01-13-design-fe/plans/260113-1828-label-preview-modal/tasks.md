# Label Preview Modal Implementation

## Phase 0: Project Setup

- [x] Initialize npm project with `npm init -y`
- [x] Install Tailwind CSS with `npm install -D tailwindcss @tailwindcss/cli` (v4 setup)
- [x] Create src/input.css with `@import "tailwindcss"` (v4 syntax)
- [x] Update package.json scripts: dev (watch) and build (minify)
- [x] Create index.html boilerplate with Tailwind CSS link to dist/output.css
- [x] Run `npm run build` and verify dist/output.css is generated

## Phase 1: Modal Implementation

- [x] Add modal container div with white bg, shadow, rounded corners, padding
- [x] Add "Label Preview" header text in gray
- [x] Create 2-column grid layout (55%/45% split with gap)
- [x] Column A: Add product title "DIRECT TO RUST METAL PAINT SMOOTH AEROSOL" in bold
- [x] Column A: Add CAS RN numbers line (123-86-4, 64742-48-9, 34590-94-8, 15956-58-8, 95-50-1)
- [x] Column A: Add EINEC Numbers line (204-658-1,265-150-3,252-104-2,240-085-3,202-425-9)
- [x] Column A: Create 3 GHS hazard pictogram SVGs (flame, exclamation, health hazard) as red diamond shapes
- [x] Column B: Add all 9 hazard statements (H222, H229, H315, H336, H412, P304+P312, P362+P364, P403+P233, P410+P412)
- [x] Add manufacturer footer with border-top: ICI Paints AkzoNobel, address, phone, website
- [x] Add Close button at bottom-left with border styling
- [x] CHECKPOINT: Run `npm run build` and verify modal renders correctly in browser
