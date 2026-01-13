# Phase 02: Form Implementation

## Context Links
- Parent: [plan.md](./plan.md)
- Depends on: [Phase 01: Page Structure](./phase-01-page-structure.md)

## Overview
- **Priority:** P2
- **Status:** Pending
- **Description:** Implement form fields with label/input grid layout

## Key Insights
- Form uses 2-column grid: labels (~130px) + inputs (flex-1)
- Mix of text inputs, radio groups, and textarea
- Inputs have light gray borders, white background
- Pre-populated with sample data

## Requirements

### Form Layout
- Grid: `grid-template-columns: 130px 1fr`
- Row gap: ~16px
- Column gap: ~24px
- Labels right-aligned or left-aligned to value column

### Form Fields

| Field | Type | Options/Value |
|-------|------|---------------|
| Package Capacity | Radio (5) | ≤3 Liters, >3L but ≤50L, >50L but ≤500L, >500 Liters, Default (selected) |
| CAS Numbers | Text | 123-86-4, 64742-48-9, 34590-94-8, 15956-58-8, 95-50-1 |
| EINEC Numbers | Text | ,204-658-1,265-150-3,252-104-2,240-085-3,202-425-9 |
| Substance Name | Text | DIRECT TO RUST METAL PAINT SMOOTH AEROSOL |
| Manufacturer | Text | ICI Paints AkzoNobel |
| Address | Text | Wexham Road, Slough, Berkshire, SL2 5DS, U.K |
| Tel | Text | +44 (0) 333 222 70 70 |
| Website | Text | www.duluxtrade.co.uk |
| Signal Word | Radio (3) | Danger, Warning, None (selected) |
| Others | Textarea | (empty) |

### Input Styling
- Border: 1px solid #E0E0E0
- Border-radius: 4px
- Padding: 8px 12px
- Height: ~40px (inputs), ~150px (textarea)
- Background: white

## Architecture

```
+----------------------------------+
| Package Capacity: | ○ ≤3L ○ >3L... |
| CAS Numbers:      | [input______]  |
| EINEC Numbers:    | [input______]  |
| Substance Name:   | [input______]  |
| Manufacturer:     | [input______]  |
| Address:          | [input______]  |
| Tel:              | [input______]  |
| Website:          | [input______]  |
| Signal Word:      | ○ Danger ○ ... |
| Others:           | [textarea___]  |
|                   | [___________]  |
+----------------------------------+
```

## Related Code Files

| Path | Action | Description |
|------|--------|-------------|
| `manage-label.html` | Modify | Add form to main content area |

## Implementation Steps

### Step 1: Form Container
```html
<form class="bg-white rounded-lg shadow p-6">
  <div class="grid grid-cols-[130px_1fr] gap-x-6 gap-y-4 items-start">
```

### Step 2: Radio Group Template (Package Capacity)
```html
<label class="text-sm text-gray-700 text-right pt-2">Package Capacity:</label>
<div class="flex flex-wrap gap-4">
  <label class="flex items-center gap-2">
    <input type="radio" name="capacity" value="3l">
    <span class="text-sm">≤ 3 Liters</span>
  </label>
  <!-- More options... -->
  <label class="flex items-center gap-2">
    <input type="radio" name="capacity" value="default" checked>
    <span class="text-sm">Default</span>
  </label>
</div>
```

### Step 3: Text Input Template
```html
<label class="text-sm text-gray-700 text-right pt-2">CAS Numbers:</label>
<input type="text"
  class="border border-gray-300 rounded px-3 py-2 text-sm"
  value="123-86-4, 64742-48-9, 34590-94-8, 15956-58-8, 95-50-1">
```

### Step 4: All Text Inputs
Add inputs for: CAS Numbers, EINEC Numbers, Substance Name, Manufacturer, Address, Tel, Website

### Step 5: Signal Word Radio Group
```html
<label class="text-sm text-gray-700 text-right pt-2">Signal Word:</label>
<div class="flex gap-6">
  <label class="flex items-center gap-2">
    <input type="radio" name="signal" value="danger">
    <span class="text-sm">Danger</span>
  </label>
  <label class="flex items-center gap-2">
    <input type="radio" name="signal" value="warning">
    <span class="text-sm">Warning</span>
  </label>
  <label class="flex items-center gap-2">
    <input type="radio" name="signal" value="none" checked>
    <span class="text-sm">None</span>
  </label>
</div>
```

### Step 6: Textarea (Others)
```html
<label class="text-sm text-gray-700 text-right pt-2">Others:</label>
<textarea class="border border-gray-300 rounded px-3 py-2 text-sm h-36 resize-y"></textarea>
```

## Todo List
- [ ] Add form container with grid layout
- [ ] Implement Package Capacity radio group (5 options)
- [ ] Add CAS Numbers text input
- [ ] Add EINEC Numbers text input
- [ ] Add Substance Name text input
- [ ] Add Manufacturer text input
- [ ] Add Address text input
- [ ] Add Tel text input
- [ ] Add Website text input
- [ ] Implement Signal Word radio group (3 options)
- [ ] Add Others textarea
- [ ] Pre-populate with sample values
- [ ] Run `npm run build`
- [ ] CHECKPOINT: Verify form renders correctly

## Success Criteria
- [ ] All 10 form fields visible
- [ ] Grid alignment correct (labels | inputs)
- [ ] Radio buttons functional (single select per group)
- [ ] "Default" selected for Package Capacity
- [ ] "None" selected for Signal Word
- [ ] Textarea resizable
- [ ] All sample data populated

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Grid alignment issues | Low | Medium | Use items-start for vertical alignment |
| Radio button spacing | Low | Low | Use flex-wrap for long radio groups |

## Security Considerations
- None (static HTML prototype)

## Next Steps
After implementation:
1. Run `npm run build`
2. Open in browser at http://localhost:8888/manage-label.html
3. Validate with Playwriter screenshot
