# Résumé update — bullets to paste in

The résumé PDF in the `portfolio` bucket (served at `/resume`) is the **January 2026** version. It predates the Ely Tool internship, the Segal shop-trainer job and PressAble. The PDF itself is not edited by the site; paste the bullets below into the résumé, export a new PDF and upload it to the bucket as `resume.pdf`. Nothing else is removed; the patent line stays.

## WORK EXPERIENCE (add at top)

- **Northwestern University, Segal Prototyping & Fabrication Lab — Shop Trainer**, Sep 2026 – present. Train students on mill, lathe and laser cutter and supervise open-shop hours; ran required shop orientation for ~40 engineering students and mill training for ~10; building a purchase-request process for missing tools and equipment.
- **Ely Tool (custom tooling, Springfield MA) — Continuous Improvement Intern**, Jul – Sep 2026. Modeled the full shop floor in SketchUp and developed the reorganization layout management adopted, from machinist interviews and floor observation; sequenced moves so the shop never closed, avoiding shutdowns estimated at ~$5,000 each and freeing 400+ sq ft; designed a barcode location system and working mockup for a dense parts room; reorganized saw room, power tools and material storage using 5S with Airtable tracking.

## PROJECT EXPERIENCE (add at top)

- **PressAble adjustable switch mount — Design Thinking & Communication**, Spring 2026. Led design and prototyping on a team of 4 for Park School (District 65) occupational therapists: Fusion 360 CAD, 3D-printed parts and assembly of a ball-joint, foam-buffered switch mount; 0 mm drift in a 60-second tapping test, ~$36 in parts per mount, handed off with STLs and a parts list.

## After uploading

Replace `resume.pdf` in the `portfolio` bucket (Supabase dashboard → Storage → portfolio), then remove the reminder line on `/review` by deleting the `RESUME_NOTE` constant in `app/review/page.tsx`.
