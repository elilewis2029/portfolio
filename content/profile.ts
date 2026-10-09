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

export type Patent = {
  /** e.g. "U.S. Patent Application Pub. No. 2025/0368466 A1" */
  number: string;
  title: string;
  role: string;
  /** e.g. "Filed May 2024, published Dec 2025, pending" */
  status: string;
  url?: string;
};

export const profile = {
  name: "Eli Lewis",
  /** Under the name on the home page and in share images. */
  headline: "Manufacturing & Design Engineering student, Northwestern ’29",
  /** Quiet second line under the headline (home and About): current roles and the patent. */
  subheadline: "Shop trainer, Segal Prototyping & Fabrication Lab · Continuous improvement intern, Ely Tool (summer 2026) · Sole inventor, US 2025/0368466 A1",
  /** The one-line pitch: what he builds. */
  tagline: "[TODO: one line in your own words about what you make, e.g. “I build things and document how they’re made.”]",
  /** The ask. Recruiters look for this first. */
  seeking: "[TODO: what you're looking for, e.g. “Seeking a Summer 2027 manufacturing / product-design engineering internship”]",
  location: "[TODO: city, e.g. “Evanston, IL”]",

  /** Bucket path (bucket `portfolio`), e.g. "profile/headshot.jpg". null = show a placeholder to the owner. */
  headshot: null as string | null,

  /** The short About paragraph on the home page. */
  blurb: "I'm a manufacturing and design engineering student who has spent the last few years in shops: restoring machines, teaching kids to build, and most recently re-planning a custom-tooling shop floor and training students on mills and lathes. I like problems where the answer has to survive contact with real users, real tolerances and a real budget.",
  /** 3–5 short paragraphs, first person, in his own voice. */
  bio: [
    "I'm a manufacturing and design engineering student who has spent the last few years in shops: restoring machines, teaching kids to build, and most recently re-planning a custom-tooling shop floor and training students on mills and lathes. I like problems where the answer has to survive contact with real users, real tolerances and a real budget. Outside the shop I'm out with the Outing Club, restoring old hand tools, or fixing fountain pens.",
  ],
  /** One line: what he's working on this quarter. */
  currently: "Shop trainer at Northwestern's Segal lab · applying for summer 2027 manufacturing and design engineering internships · building a workbench with my woodworking mentor",
  interests: ["[TODO: interests outside engineering, 3–5 words each]"],

  links: {
    email: "", // falls back to CONTACT_EMAIL / OWNER_EMAIL
    linkedin: "https://www.linkedin.com/in/eli-lewis-758217330",
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
      org: "Northwestern University — Segal Prototyping & Fabrication Lab",
      title: "Shop Trainer",
      dates: "Sep 2026 – present",
      location: "Evanston, IL",
      bullets: [
        "Train students on the mill, lathe and laser cutter, and supervise open-shop hours in Northwestern's main student machine shop.",
        "Trained about 40 engineering students through required shop orientation and about 10 on the mill.",
        "Focus my teaching on hand-tool fundamentals (hand-saw stance and stroke, filing, safe knife use), where new students struggle most.",
        "Building a purchase-request form so trainers can report missing tools and propose equipment that would improve the shop.",
      ],
    },
    {
      org: "Ely Tool",
      title: "Continuous Improvement Intern",
      dates: "Jul–Sep 2026",
      location: "Springfield, MA",
      bullets: [
        "Built a 3D model of the whole shop and, from machinist interviews and floor observation, developed the layout the company chose for its reorganization.",
        "Sequenced the moves so the shop kept running: cleared benches first to open the center to a forklift, then moved machines in stages, avoiding full-day shutdowns we estimated at about $5,000 each.",
        "Designed a barcode-based location system for a densely packed parts room and built a working mockup.",
        "Reorganized the saw room, power tools and material storage using 5S, and set up Airtable-based tracking.",
      ],
    },
    {
      org: "Recirclable (reusable take-out container service)",
      title: "Product Feedback & Prototyping Intern",
      dates: "Summer 2024",
      location: "Newton, MA",
      bullets: [
        "Prototyped a hybrid portable/stationary card-scanning device in Fusion 360 and 3D printing so staff could scan at the table or the front desk.",
        "Interviewed 6 current and prospective restaurant partners and fed the findings into the design.",
      ],
    },
    {
      org: "JCC Greater Boston",
      title: "Makerspace Lead",
      dates: "Aug 2022 – May 2025",
      location: "Needham, MA",
      bullets: [
        "Built and ran a bi-weekly after-school makerspace for up to 16 kids, using upcycled materials and salvaged electronics.",
        "Set up the storage system for hundreds of materials and tools; ran the summer-camp version for older kids.",
      ],
    },
    {
      org: "Brimmer and May School",
      title: "VEX V5 Robotics Team Captain",
      dates: "Fall 2023 – Winter 2025",
      location: "Newton, MA",
      bullets: [
        "Led a team of 5 through research, design and assembly of a competition robot.",
        "Reorganized supplies and inventory; assembly time roughly halved.",
      ],
    },
    {
      org: "Private",
      title: "3D Printing & STEM Tutor",
      dates: "2021 – present",
      bullets: [
        "One-on-one 3D printing, CAD and printer troubleshooting; weekly engineering activities for kids with behavioral challenges using household materials.",
      ],
    },
  ] as Experience[],

  patents: [
    {
      number: "U.S. Patent Application Pub. No. 2025/0368466 A1",
      title: "Handheld Tape Dispenser and Methods of Use Thereof",
      role: "Sole inventor",
      status: "Filed May 2024, published Dec 2025, pending",
      url: "https://patents.google.com/patent/US20250368466A1/en",
    },
  ] as Patent[],

  /** Grouped skills, honest proficiency. Empty groups are hidden. */
  skills: {
    "CAD & CAM": ["[TODO: e.g. Fusion 360, SolidWorks, Onshape; CAM for which machines]"],
    "Fabrication": ["[TODO: e.g. manual mill, manual lathe, CNC mill, TIG/MIG, 3D printing (FDM/resin), sheet metal, composites]"],
    "Electronics": ["[TODO: e.g. soldering/micro-soldering, Arduino, PCB layout (KiCad?)]"],
    "Analysis & software": ["[TODO: e.g. MATLAB, Python, FEA basics, GD&T reading]"],
    "Shop & measurement": ["[TODO: e.g. calipers/micrometers, CMM, surface finish, 5S]"],
  } as Record<string, string[]>,

  involvement: [
    {
      org: "Peer Tutoring Program, Brimmer and May School",
      role: "Co-founder & co-head",
      dates: "May 2023 – May 2025",
      note: "Designed a system supporting 15+ tutors with self-serve scheduling; set criteria, reviewed applications and coordinated faculty referrals.",
    },
    { org: "[TODO: confirm which to list — Northwestern: ASME, NUOC (Northwestern Outing Club)]", role: "[TODO: role]", dates: "[TODO: dates]" },
    {
      org: "Fine-woodworking mentorship with John Hartman, professional woodworker",
      role: "Mentee",
      dates: "Spring 2025 – present",
      note: "Began with my hand-plane senior project; now working on a workbench and other furniture projects. Taught me to plan the order of operations, keep setups and reference surfaces consistent, and account for grain direction and wood movement, habits that carry straight into machining.",
    },
  ] as Involvement[],

  awards: ["[TODO: awards, competition placings, certifications (e.g. CSWA) — or leave empty]"],
};

export type Profile = typeof profile;
