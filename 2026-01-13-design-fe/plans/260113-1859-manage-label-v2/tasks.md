# Manage Label Form V2 (Ralph Build)

## Phase 1: Page Structure

- [x] Create manage-label-v2.html with DOCTYPE, head with Tailwind link (./dist/output.css), body with h-screen flex bg-gray-100
- [x] Add sidebar: aside with w-[280px] bg-[#3D3557] text-white, containing nav with 11 items
- [x] Sidebar nav items: Substance Information, Internal Information, Transport Information, Hazard & PPE Labelling, Phrases/Statements, Spillage Storage and Waste, Work Exposure Limits (WELS), Usage, History, Revisions, Manage Label (active with bg-blue-500)
- [x] Add main container: main with flex-1 flex flex-col overflow-hidden

## Phase 2: Header & Footer

- [x] Add header: header with p-4 flex gap-2 bg-white border-b containing 3 buttons
- [x] Header button 1: "Autopopulate SDS Details" with bg-purple-600 text-white px-4 py-2 rounded text-sm
- [x] Header button 2: "View SDS" with border border-gray-300 px-4 py-2 rounded text-sm
- [x] Header button 3: "View Risk Summary" with border border-red-500 text-red-500 px-4 py-2 rounded text-sm
- [ ] Add footer: footer with p-4 flex justify-end gap-2 bg-white border-t
- [ ] Footer buttons: "Preview" (border gray) and "Publish" (bg-blue-500 text-white)

## Phase 3: Form Fields

- [ ] Add form container: div with flex-1 p-6 overflow-auto, containing form with bg-white rounded-lg shadow p-6
- [ ] Form grid: div with grid grid-cols-[140px_1fr] gap-x-6 gap-y-4 items-start
- [ ] Package Capacity: label + 5 radio buttons (≤3 Liters, >3L but ≤50L, >50L but ≤500L, >500 Liters, Default checked)
- [ ] CAS Numbers: label + text input with value "123-86-4, 64742-48-9, 34590-94-8, 15956-58-8, 95-50-1"
- [ ] EINEC Numbers: label + text input with value ",204-658-1,265-150-3,252-104-2,240-085-3,202-425-9"
- [ ] Substance Name: label + text input with value "DIRECT TO RUST METAL PAINT SMOOTH AEROSOL"
- [ ] Manufacturer: label + text input with value "ICI Paints AkzoNobel"
- [ ] Address: label + text input with value "Wexham Road, Slough, Berkshire, SL2 5DS, U.K"
- [ ] Tel: label + text input with value "+44 (0) 333 222 70 70"
- [ ] Website: label + text input with value "www.duluxtrade.co.uk"
- [ ] Signal Word: label + 3 radio buttons (Danger, Warning, None checked)
- [ ] Others: label + textarea with h-36 resize-y
- [ ] CHECKPOINT: Run npm run build and open in browser to verify
