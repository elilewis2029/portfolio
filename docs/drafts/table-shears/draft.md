# Table Shears — page record

Status: on the live site as a **draft** (project `8e76106e-49cf-4dec-ba7c-5ae8b72a5065`, slug `table-shears-scissors-you-run-with-one-push`, /review/8e76106e-49cf-4dec-ba7c-5ae8b72a5065). Eli does the final polish and publishes from /review. Text below is what was saved on 2026-10-08; the site is the source of truth after that.

Facts come from Eli's final report (`1.3_Final_Report_V3`, exported as `TableShears_dtc_wq26_01-03.pdf` in his Drive) and his answers in chat:
- Blades: waterjet-cut profiles, bevel applied on the mill.
- Key design decision: fewer movement variables and stronger muscle groups. Scissors need fine finger control, arm control and holding the material in mid-air; this is one table-mounted lever, gripped in the whole hand, that moves one way or the other, with the material on the platform.
- OK to name Envision Unlimited (his photo shows the delivery label).
- No result number; `result_metric` left empty.

## Fields
- **title:** Table Shears: scissors you run with one push
- **tagline:** A one-handed tabletop cutter: a bearing-mounted four-bar linkage and blades I made from 1084 steel.
- **summary:** Members at Envision Unlimited, a Chicago day program for adults with intellectual and developmental disabilities, usually handed their art-class cutting to staff: scissors ask for fine finger control, arm control and holding the material in mid-air, all at once. Table Shears cuts that down to one table-mounted lever, gripped in the whole hand and driven by stronger muscle groups, that only moves forward or back while the material stays on the platform. In testing, a member cut with it and liked how easily it went through material.
- **role_kind:** team
- **role:** I did the design and prototyping: the four-bar mechanism, the parametric Fusion 360 model, making the blades, and assembly. I also taught my teammates the shop processes. They led user research and documentation.
- **duration:** Winter quarter 2026 · **year:** 2026
- **goal_constraints:**
  - The client's goal was independence. Members should cut on their own, with real scissors, not "safe" or childlike ones.
  - Users struggled with grip, fine motor control and holding the material steady, but were comfortable with big arm motions.
  - Cuts paper, felt, foam, fabric and thin cardboard; 12 × 12 in workspace; about 2.5 lb.
- **process_md:**
  - Cut the number of movements a user has to control. Instead of fingers, wrist and a free hand holding the work, there is one lever, gripped in the whole hand, that only goes one way or the other.
  - The handle drives two connecting arms that swing the top blade down against a fixed bottom blade, so a large push becomes a small, controlled cut.
  - Built the model in Fusion 360, fully parametric, so bearing size, blade size and material thickness could change without breaking it.
  - Made the blades from 1084 high-carbon steel: waterjet-cut the profiles, milled the bevel, heat-treated them, then hand-sharpened on 325 and 1000 grit stones.
  - Printed the lever, arms and joints in ABS, reamed the pivots to 3 and 7 mm, and pressed in seven ball bearings so the lever moves without extra force.
- **result_metric:** none
- **lesson:** Cover more of the blade, and add a tilt so curved cuts are easier. A return spring would also let members cut with a push alone, since some can push or pull comfortably but not both.
- **tools:** fusion-360, fdm-3d-printing, waterjet, manual-mill, heat-treating, reaming
- **skills:** mechanism-design, parametric-cad, human-centered-design, user-testing, prototyping
- **audience:** pd, mech · **category:** engineering

## Photos (in order)
1. hero — The finished prototype on its cutting mat, lever up. (report)
2. drawing — How it's used: one hand pushes the lever, the other guides the material. (report)
3. drawing — Side view of the linkage inside the housing. (report)
4. cad — Fusion 360 model with the housing see-through: lever, connecting arms and blade. (report)
5. process — Milling the bevel on a waterjet-cut blade blank.
6. process — Heat treating: bringing the 1084 blade to red heat with torches, quench bucket ready.
7. process — The blade after heat treating, with the milled bevel along the edge.
8. process — The linkage assembled in the printed housing, with bearing blocks, lever and blade.
9. process — Cutting mat fitted over the housing, blade in its slot.
10. after — Finished and labeled for delivery to Envision Unlimited.

The placeholder `todo-northwestern-course-project` is gone from the live project.
