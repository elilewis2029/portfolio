# Table Shears — draft carried over from the earlier content session (2026-10-06)

Status: NOT yet on the site. The earlier session had extracted four images from Eli's final report PDF and drafted the text below, then stopped to ask four questions. Its container is gone, so the images must be re-extracted from the report (Eli re-attaches it) or replaced with photos. Facts below came from Eli's report and notes in that session; anything uncertain is marked `[TODO]`.

## Images (from the final report)
1. Main image, cover: the finished prototype on its cutting mat, lever up, blade showing.
2. Drawing: how it's used. One hand pushes the lever, the other guides the paper.
3. Drawing: wireframe side view of the linkage inside the housing.
4. CAD: render with the housing see-through, showing the lever, connecting arms and blade.

Missing and worth asking for: build photos (blade making, heat treating, bearings going in).

## Title options (Eli to pick)
- A: "Table Shears: scissors you run with one push"
- B: "A four-bar scissor mechanism for adults who can't grip scissors"
- C: "Turning scissors into a one-handed lever"

## Draft fields
- **tagline:** A tabletop cutter for adults with limited hand control: a bearing-mounted four-bar linkage turns a broad push into a clean shear, using blades I made from 1084 steel.
- **summary:** Members at Envision Unlimited, a Chicago day program for adults with intellectual and developmental disabilities, usually handed their art-class cutting to staff because scissors need grip, fine control and two hands. Table Shears replaces all three with one broad push on a lever, while a tacky mat holds the material still. In testing, a member cut with it and liked how easily it went through material.
- **role_kind:** team (of 3)
- **role:** I did the design and prototyping: the four-bar mechanism, the parametric Fusion 360 model, making the blades, and assembly. I also taught my teammates the shop processes. They led user research and documentation.
- **duration:** Winter quarter 2026
- **goal_constraints:**
  - The client's goal was independence. Members should cut on their own, with real scissors, not "safe" or childlike ones.
  - Users struggled with grip, fine motor control and holding the material steady, but were comfortable with big arm motions.
  - It cuts paper, felt, foam, fabric and thin cardboard; fits letter-size sheets (12 × 12 in workspace); and is light enough to carry between rooms (about 2.5 lb).
- **process_md:**
  - Watched members cut in a craft session and interviewed staff. Big arm motions came easily; the scissor grip and two-handed coordination didn't.
  - Replaced the grip with a lever. The handle drives two connecting arms that swing the top blade down against a fixed bottom blade, so a large push becomes a small, controlled cut.
  - Built the model in Fusion 360, fully parametric, so bearing size, blade size and material thickness could change without breaking it.
  - Made the blades from 1084 high-carbon steel: [TODO: waterjet-cut?], heat-treated, then hand-sharpened on 325 and 1000 grit stones.
  - Printed the lever, arms and joints in ABS, reamed the pivots to 3 and 7 mm, and pressed in seven ball bearings so the lever moves without extra force.
  - A tacky grid mat holds the material, so one hand guides it and the other pushes.
- **result_metric:** [TODO: a number if Eli has one, e.g. lever force, cuts per minute, part cost]. Otherwise: a working prototype that cut every craft material on the list in a member's hands.
- **lesson:** Cover more of the blade, and add a tilt so curved cuts are easier. A return spring would also let members cut with a push alone, since some can push or pull comfortably but not both.
- **tools:** fusion-360, fdm-3d-printing, heat-treating, hand-sharpening, reaming
- **skills:** mechanism-design, parametric-cad, human-centered-design, user-testing, prototyping
- **audience:** pd, mech · **category:** engineering

## Open questions for Eli (unanswered)
1. Title: A, B or C?
2. Blade: was it waterjet-cut, and did he heat-treat it himself?
3. Naming: OK to name Envision Unlimited on a public page?
4. What makes it his: is there one design decision that drove this one, the way the "final inch" did for PressAble?

## Where it goes
Replace the placeholder draft `todo-northwestern-course-project` (delete it, create the new entry with `npm run portfolio -- new`), keep it a draft until Eli publishes from /review.
