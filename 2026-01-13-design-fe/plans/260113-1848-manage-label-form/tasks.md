# Manage Label Form Page Implementation

## Phase 1: Page Structure & Sidebar

- [x] Create manage-label.html with Tailwind link
- [x] Add flexbox page container (h-screen)
- [x] Build sidebar (280px, dark purple #3D3557)
- [x] Add 11 nav items with icons (Substance Info, Internal Info, Transport Info, Hazard & PPE Labelling, Phrases/Statements, Spillage Storage and Waste, Work Exposure Limits WELS, Usage, History, Revisions, Manage Label)
- [x] Style active "Manage Label" item with blue highlight
- [x] Create main content container (flex-col)
- [x] Add header with 3 buttons (Autopopulate SDS Details purple, View SDS gray, View Risk Summary red)
- [x] Add footer with Preview (gray) and Publish (blue) buttons right-aligned

## Phase 2: Form Implementation

- [x] Add form container with white bg, shadow, padding
- [x] Create grid layout (140px labels + flex-1 inputs)
- [x] Package Capacity: 5 radio options (≤3L, >3L≤50L, >50L≤500L, >500L, Default selected)
- [x] CAS Numbers: text input with value "123-86-4, 64742-48-9, 34590-94-8, 15956-58-8, 95-50-1"
- [x] EINEC Numbers: text input with value ",204-658-1,265-150-3,252-104-2,240-085-3,202-425-9"
- [x] Substance Name: text input with value "DIRECT TO RUST METAL PAINT SMOOTH AEROSOL"
- [x] Manufacturer: text input with value "ICI Paints AkzoNobel"
- [x] Address: text input with value "Wexham Road, Slough, Berkshire, SL2 5DS, U.K"
- [x] Tel: text input with value "+44 (0) 333 222 70 70"
- [x] Website: text input with value "www.duluxtrade.co.uk"
- [x] Signal Word: 3 radio options (Danger, Warning, None selected)
- [x] Others: empty textarea (~150px height)
- [x] CHECKPOINT: Run `npm run build` and verify in browser
