# Phase 01: Page Structure & Sidebar

## Context Links
- Parent: [plan.md](./plan.md)

## Overview
- **Priority:** P2
- **Status:** Pending
- **Description:** Create HTML structure with 3-column layout and sidebar navigation

## Key Insights
- 3-column layout: Sidebar (fixed 280px) + Form Labels (~130px) + Form Inputs (flex-1)
- Sidebar is dark purple with white text, blue active state
- Full viewport height, no scroll on sidebar

## Requirements

### Layout Structure
- Full viewport height (`h-screen`)
- Flexbox row layout
- Sidebar fixed width, main content flex-1

### Sidebar Specs
- Width: 280px
- Background: Dark purple (#3D3557 or similar)
- 12 navigation items with icons
- Active item: Blue highlight (#2196F3)
- Items: Substance Info, Internal Info, Transport Info, Hazard & PPE Labelling, Phrases/Statements, Spillage Storage and Waste, Work Exposure Limits (WELS), Usage, History, Revisions, Manage Label (active)

### Header Specs
- 3 buttons left-aligned
- "Autopopulate SDS Details" - purple filled
- "View SDS" - gray outline
- "View Risk Summary" - red outline/text

## Architecture

```
+----------------------------------------------------------+
| SIDEBAR    |  HEADER: [Autopopulate] [View SDS] [Risk]   |
| (280px)    +----------------------------------------------+
|            |  MAIN CONTENT AREA                          |
| Nav items  |  (Form will go here in Phase 2)             |
|            |                                              |
|            +----------------------------------------------+
|            |  FOOTER: [Preview] [Publish]                |
+----------------------------------------------------------+
```

## Related Code Files

| Path | Action | Description |
|------|--------|-------------|
| `manage-label.html` | Create | Main page file |

## Implementation Steps

### Step 1: HTML Boilerplate
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manage Label</title>
  <link href="./dist/output.css" rel="stylesheet">
</head>
<body class="h-screen flex bg-gray-100">
```

### Step 2: Sidebar Structure
```html
<aside class="w-[280px] bg-[#3D3557] text-white flex flex-col shrink-0">
  <!-- Nav items -->
</aside>
```

### Step 3: Sidebar Navigation Items
Each item structure:
```html
<a href="#" class="flex items-center gap-3 px-4 py-3 hover:bg-white/10">
  <span class="w-5 h-5"><!-- Icon --></span>
  <span>Item Text</span>
</a>
```

Active item:
```html
<a href="#" class="flex items-center gap-3 px-4 py-3 bg-blue-500">
  <span class="w-5 h-5"><!-- Icon --></span>
  <span>Manage Label</span>
</a>
```

### Step 4: Main Content Container
```html
<main class="flex-1 flex flex-col">
  <header class="p-4 flex gap-2"><!-- Buttons --></header>
  <div class="flex-1 p-6 overflow-auto"><!-- Form area --></div>
  <footer class="p-4 flex justify-end gap-2"><!-- Footer buttons --></footer>
</main>
```

### Step 5: Header Buttons
```html
<button class="bg-purple-600 text-white px-4 py-2 rounded">Autopopulate SDS Details</button>
<button class="border border-gray-300 px-4 py-2 rounded">View SDS</button>
<button class="border border-red-500 text-red-500 px-4 py-2 rounded">View Risk Summary</button>
```

### Step 6: Footer Buttons
```html
<button class="border border-gray-300 px-4 py-2 rounded">Preview</button>
<button class="bg-blue-500 text-white px-4 py-2 rounded">Publish</button>
```

## Todo List
- [ ] Create manage-label.html with Tailwind link
- [ ] Add flexbox page container (h-screen)
- [ ] Build sidebar (280px, dark purple)
- [ ] Add 12 nav items with icons
- [ ] Style active "Manage Label" item (blue)
- [ ] Create main content container
- [ ] Add header with 3 buttons
- [ ] Add footer with Preview/Publish buttons

## Success Criteria
- [ ] Page fills viewport height
- [ ] Sidebar fixed at 280px
- [ ] 12 nav items visible with icons
- [ ] "Manage Label" highlighted blue
- [ ] Header buttons styled correctly
- [ ] Footer buttons right-aligned

## Next Steps
Proceed to [Phase 02: Form Implementation](./phase-02-form-implementation.md)
