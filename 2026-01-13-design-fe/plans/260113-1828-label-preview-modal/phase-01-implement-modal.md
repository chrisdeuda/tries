# Phase 01: Implement Label Preview Modal

## Context Links
- Parent: [plan.md](./plan.md)
- Depends on: [Phase 00: Project Setup](./phase-00-project-setup.md)
- Design Spec: From UI reverse engineering analysis in conversation

## Overview
- **Priority:** P2
- **Status:** Pending
- **Description:** Implement the Label Preview modal in index.html using Tailwind CSS

## Key Insights
- Modal is a product label preview for paint (aerosol can)
- Displays chemical safety information per GHS standards
- Two distinct content zones require grid/flex layout
- GHS pictograms are standard symbols (flame, exclamation, health hazard)

## Requirements

### Functional
- Display product title: "DIRECT TO RUST METAL PAINT SMOOTH AEROSOL"
- Show CAS RN numbers: 123-86-4, 64742-48-9, 34590-94-8, 15956-58-8, 95-50-1
- Show EINEC numbers: 204-658-1,265-150-3,252-104-2,240-085-3,202-425-9
- Display 3 GHS hazard pictograms in diamond shape
- List 9 hazard/precautionary statements (H222-H412, P304+P312-P410+P412)
- Show manufacturer info: ICI Paints AkzoNobel, address, phone, website
- Close button at bottom-left

### Non-Functional
- Single file, no dependencies except Tailwind CDN
- Viewable directly in browser
- Clean, maintainable HTML structure

## Architecture

### Layout Structure
```
+------------------------------------------+
|  Label Preview (header)                  |
+------------------------------------------+
|  Column A (55%)  |  Column B (45%)       |
|  - Title         |  - H-statements       |
|  - CAS numbers   |  - P-statements       |
|  - EINEC numbers |                       |
|  - 3 icons       |                       |
+------------------------------------------+
|  Manufacturer: ICI Paints... (footer)    |
+------------------------------------------+
|  [Close]                                 |
+------------------------------------------+
```

### Tailwind Classes Strategy
- Container: `max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8`
- Grid: `grid grid-cols-[55%_45%] gap-12`
- Title: `text-xl font-bold`
- Icons: `flex gap-5` with inline SVG diamonds
- Footer: `border-t pt-4 text-sm text-gray-600`
- Button: `border border-gray-300 px-4 py-2 rounded`

## Related Code Files

### Files to Modify
| Path | Action | Description |
|------|--------|-------------|
| `index.html` | Modify | Add modal implementation to body |

## Implementation Steps

### Step 1: Modal Container
Add inside `<body>` of index.html:
```html
<div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 my-8">
```

### Step 2: Header Section
- Gray "Label Preview" text
- `<p class="text-gray-500 mb-6">Label Preview</p>`

### Step 3: Two-Column Grid Body
```html
<div class="grid grid-cols-[55%_45%] gap-12">
  <!-- Column A -->
  <div>...</div>
  <!-- Column B -->
  <div>...</div>
</div>
```

### Step 4: Column A Content
1. Title: `<h1 class="text-xl font-bold mb-4">DIRECT TO RUST...</h1>`
2. CAS RN line: `<p class="text-sm mb-1">CAS RN: 123-86-4, ...</p>`
3. EINEC line: `<p class="text-sm mb-6">EINEC Numbers ,204-658-1,...</p>`
4. Icon row: `<div class="flex gap-5">` with 3 SVG icons

### Step 5: GHS Hazard Pictogram SVGs
Create inline SVGs for each:

**Flame (GHS02):**
- Diamond shape (rotated square)
- Red border (#DC2626), white fill
- Black flame symbol inside

**Exclamation (GHS07):**
- Diamond shape
- Red border, white fill
- Black exclamation mark

**Health Hazard (GHS08):**
- Diamond shape
- Red border, white fill
- Black human silhouette with star

### Step 6: Column B Content
List of statements:
```html
<div class="space-y-1 text-sm">
  <p>H222: Extremely flammable material</p>
  <p>H229: Pressurised container May burst if heated</p>
  <!-- ... 7 more statements -->
</div>
```

### Step 7: Manufacturer Footer
```html
<div class="border-t mt-8 pt-4 text-xs text-gray-600">
  <p>
    Manufacturer: <strong>ICI Paints AkzoNobel</strong> |
    Address: Wexham Road, Slough, Berkshire, SL2 5DS, U.K |
    Tel: <strong>+44 (0) 333 222 70 70</strong> |
    Website: <a href="#" class="text-blue-600">www.duluxtrade.co.uk</a>
  </p>
</div>
```

### Step 8: Close Button
```html
<div class="mt-6">
  <button class="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">
    Close
  </button>
</div>
```

## Todo List
- [ ] Add modal container to index.html
- [ ] Add header "Label Preview" text
- [ ] Implement 2-column grid layout
- [ ] Add Column A content (title, codes, icons)
- [ ] Create 3 GHS pictogram SVGs
- [ ] Add Column B hazard statements
- [ ] Add manufacturer footer
- [ ] Add Close button
- [ ] Run `npm run build` to compile CSS
- [ ] Test in browser

## Success Criteria
- [ ] Opens in browser without errors
- [ ] Layout matches original screenshot
- [ ] Two distinct columns visible
- [ ] All 3 GHS icons render correctly
- [ ] All 9 statements displayed
- [ ] Manufacturer info complete
- [ ] Close button styled correctly

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SVG complexity | Low | Low | Use simplified geometric shapes |
| Column alignment | Low | Medium | Test grid-cols values |

## Security Considerations
- None (static HTML, no user input, no data handling)

## Next Steps
After implementation:
1. Open in browser to verify
2. Compare against original screenshot
3. Adjust spacing/sizing if needed
