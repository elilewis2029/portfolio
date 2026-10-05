/**
 * Site-wide profile content. Edit this file (or ask Claude to) — it is the single source for the hero,
 * /about, header/footer links, share images and the sitemap.
 *
 * Placeholders: any string that starts with "[TODO" is shown ONLY to the signed-in owner, highlighted.
 * Visitors never see it; a section whose every value is a TODO is hidden for them. docs/INPUTS.md lists
 * everything still marked TODO.
 */

export type Experience = {
  org: string;
  title: string;
  /** e.g. "Jun–Aug 2026" */
  dates: string;
  location?: string;
  bullets: string[];
};

export type Education = {
  school: string;
  degree: string;
  expected: string;
  location?: string;
  /** Optional; convention is to show it only when it helps (>= 3.5). */
  gpa?: string;
  coursework: string[];
  honors: string[];
};

export type Involvement = { org: string; role: string; dates: string; note?: string };

export const profile = {
  name: "Eli Lewis",
  /** Under the name on the home page and in share images. */
  headline: "Manufacturing & Design Engineering student, Northwestern ’29",
  /** The one-line pitch: what he builds. */
  tagline: "[TODO: one line in your own words about what you make, e.g. “I build things and document how they’re made.”]",
  /** The ask. Recruiters look for this first. */
  seeking: "[TODO: what you're looking for, e.g. “Seeking a Summer 2027 manufacturing / product-design engineering internship”]",
  location: "[TODO: city, e.g. “Evanston, IL”]",

  /** Bucket path (bucket `portfolio`), e.g. "profile/headshot.jpg". null = show a placeholder to the owner. */
  headshot: null as string | null,

  /** 3–5 short paragraphs, first person, in his own voice. */
  bio: [
    "[TODO: paragraph 1 — who you are and what you like building (2–3 sentences)]",
    "[TODO: paragraph 2 — how you got into making things; the shop, restorations, electronics]",
    "[TODO: paragraph 3 — what you're doing now at Northwestern and what you want to work on next]",
  ],
  /** One line: what he's working on this quarter. */
  currently: "[TODO: what you're working on right now, e.g. a class project, a club build]",
  interests: ["[TODO: interests outside engineering, 3–5 words each]"],

  links: {
    email: "", // falls back to CONTACT_EMAIL / OWNER_EMAIL
    linkedin: "[TODO: LinkedIn profile URL]",
    github: "[TODO: GitHub URL, or delete this line if you don't want one shown]",
    instagram: "",
    youtube: "",
  },

  education: {
    school: "Northwestern University",
    degree: "B.S. Manufacturing & Design Engineering (MaDE)",
    expected: "Expected 2029",
    location: "Evanston, IL",
    gpa: "[TODO: GPA, or leave blank to omit]",
    coursework: ["[TODO: relevant coursework so far, e.g. DTC, manufacturing processes, CAD, materials]"],
    honors: ["[TODO: honors, scholarships, dean's list — or leave empty]"],
  } satisfies Education,

  experience: [
    {
      org: "Ely Tool",
      title: "Machinist (summer job)",
      dates: "[TODO: months, e.g. “Jun–Aug 2026”]",
      location: "[TODO: city]",
      bullets: [
        "[TODO: what you actually ran and made: machines (manual/CNC mill, lathe), materials, part types]",
        "[TODO: one number: tolerance held, parts made, setup time cut, scrap reduced]",
        "[TODO: anything you designed: fixtures, soft jaws, process improvements]",
      ],
    },
    {
      org: "[TODO: other jobs, internships or makerspace roles — or delete this entry]",
      title: "[TODO: title]",
      dates: "[TODO: dates]",
      bullets: ["[TODO: 1–3 bullets]"],
    },
  ] as Experience[],

  /** Grouped skills, honest proficiency. Empty groups are hidden. */
  skills: {
    "CAD & CAM": ["[TODO: e.g. Fusion 360, SolidWorks, Onshape; CAM for which machines]"],
    "Fabrication": ["[TODO: e.g. manual mill, manual lathe, CNC mill, TIG/MIG, 3D printing (FDM/resin), sheet metal, composites]"],
    "Electronics": ["[TODO: e.g. soldering/micro-soldering, Arduino, PCB layout (KiCad?)]"],
    "Analysis & software": ["[TODO: e.g. MATLAB, Python, FEA basics, GD&T reading]"],
    "Shop & measurement": ["[TODO: e.g. calipers/micrometers, CMM, surface finish, 5S]"],
  } as Record<string, string[]>,

  involvement: [
    { org: "[TODO: clubs/teams at Northwestern — Formula Racing, Baja, robotics, Segal design groups…]", role: "[TODO: role]", dates: "[TODO: dates]" },
    { org: "[TODO: community makerspace from high school]", role: "[TODO: role, e.g. leadership / teaching]", dates: "[TODO: dates]" },
  ] as Involvement[],

  awards: ["[TODO: awards, competition placings, certifications (e.g. CSWA) — or leave empty]"],
};

export type Profile = typeof profile;
