/**
 * Dashboard content-type configuration.
 *
 * One field-driven config per content type drives the list, the form and the
 * server action, so all nine screens stay consistent and a new field is one
 * line rather than a new screen. Everything here must be serialisable — it
 * crosses the server/client boundary into EntityManager.
 *
 * The field lists are the audit table in DESIGN_NOTES.md, in order.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "toggle"
  | "select"
  | "datalist"
  | "tags"
  | "lines"
  /** Repeatable single-value rows, each individually editable. */
  | "list"
  | "image"
  /** Multi-image manager writing to a related table. */
  | "gallery"
  /** Categorised project media (hero / gallery / drawings / materials / …). */
  | "media"
  | "date"
  | "links";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  /** Shown under the input — used to disambiguate lookalike fields. */
  help?: string;
  /** Span both columns. */
  full?: boolean;
  required?: boolean;
};

export type ModelConfig = {
  slug: string;
  label: string;
  plural: string;
  /** Prisma delegate name on the client. */
  model: string;
  fields: Field[];
  /** Field rendered as the row title. */
  primaryField: string;
  /** Fields joined into the row subtitle. */
  secondaryFields: string[];
  orderBy: Record<string, "asc" | "desc">;
  /** Public routes to revalidate after any mutation. */
  revalidate: string[];
  /** Inbox is list + delete only. */
  readOnly?: boolean;
};

const SKILL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Databases",
  "DevOps",
  "AI/ML",
  "CMS/E-commerce",
  "Tools",
];

export const MODELS: Record<string, ModelConfig> = {
  projects: {
    slug: "projects",
    label: "Project",
    plural: "Projects",
    model: "project",
    primaryField: "title",
    secondaryFields: ["status", "year", "location"],
    orderBy: { order: "asc" },
    revalidate: ["/", "/work", "/portfolio"],
    fields: [
      { name: "title", label: "Project name", type: "text", required: true },
      {
        name: "slug",
        label: "Slug",
        type: "text",
        placeholder: "auto from the name if left blank",
        help: "URL segment — /work/<slug>",
      },
      {
        name: "typology",
        label: "Type",
        type: "select",
        options: [
          "",
          "RESIDENTIAL",
          "HOSPITALITY",
          "CULTURAL",
          "COMMERCIAL",
          "INSTITUTIONAL",
          "URBAN",
          "INTERIORS",
          "LANDSCAPE",
        ],
        help: "Drives the typology filter on /work. Only types in use appear there.",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["CONCEPT", "COMPETITION", "UNDER_CONSTRUCTION", "COMPLETED", "UNBUILT"],
      },
      { name: "location", label: "Location", type: "text", placeholder: "Aswan, Egypt" },
      {
        name: "year",
        label: "Year",
        type: "text",
        placeholder: "2024",
        help: "The compact value on archive cards.",
      },
      {
        name: "period",
        label: "Full timeframe",
        type: "text",
        placeholder: "2021 — 2024",
        help: "Shown on the project page in place of the year when set.",
      },
      { name: "area", label: "Area", type: "text", placeholder: "2,400 m²" },
      { name: "client", label: "Client", type: "text", placeholder: "Private" },
      {
        name: "collaborators",
        label: "Collaborators",
        type: "tags",
        full: true,
        help: "Engineers, landscape architects, consultants.",
      },
      {
        name: "tagline",
        label: "Short description (cards & search)",
        type: "text",
        full: true,
      },
      {
        name: "statement",
        label: "Statement",
        type: "textarea",
        full: true,
        help: "The concept and intent — why this building exists. Editorial, not marketing. Blank line separates paragraphs.",
      },
      {
        name: "description",
        label: "Extended description",
        type: "textarea",
        full: true,
        help: "Optional longer text below the statement.",
      },
      {
        name: "siteDescription",
        label: "Context / site",
        type: "textarea",
        full: true,
        help: "The site, its constraints and what the building answers. Optional — the section hides when empty.",
      },
      { name: "orientation", label: "Orientation", type: "text", placeholder: "North–south axis" },
      { name: "climate", label: "Climate", type: "text", placeholder: "Hot arid" },
      {
        name: "structuralConcept",
        label: "Technical — structure",
        type: "textarea",
        full: true,
        help: "Optional. Most projects leave the whole technical section blank.",
      },
      { name: "environmentalStrategy", label: "Technical — environmental strategy", type: "textarea", full: true },
      { name: "lightingConcept", label: "Technical — lighting", type: "textarea", full: true },
      { name: "constructionDetail", label: "Technical — construction detail", type: "textarea", full: true },
      {
        name: "stages",
        label: "Timeline",
        type: "list",
        full: true,
        placeholder: "Design development — 2022",
        help: 'One stage per row, written "Stage — Year". Optional.',
      },
      {
        name: "recognition",
        label: "Recognition",
        type: "list",
        full: true,
        placeholder: "Aga Khan Award for Architecture, shortlist, 2024",
        help: "Awards or press, one per row. Up to three are shown.",
      },
      {
        name: "coverImage",
        label: "Cover image",
        type: "image",
        full: true,
        help: "Fallback for archive cards when no Hero media is set.",
      },
      {
        name: "heroEmbedUrl",
        label: "Hero film (Vimeo / YouTube)",
        type: "text",
        full: true,
        placeholder: "https://vimeo.com/…",
        help: "Long-form walkthroughs belong here rather than as an upload — they stream properly and cost no storage.",
      },
      {
        name: "media",
        label: "Media",
        type: "media",
        full: true,
        help: "Each section below maps to a section of the project page.",
      },
      { name: "featured", label: "Featured on the home page", type: "toggle" },
      { name: "showOnPortfolio", label: "Show on the portfolio page", type: "toggle" },
      { name: "order", label: "Order", type: "number" },
    ],
  },

  skills: {
    slug: "skills",
    label: "Skill",
    plural: "Skills",
    model: "skill",
    primaryField: "name",
    secondaryFields: ["category", "level"],
    orderBy: { order: "asc" },
    revalidate: ["/skills", "/portfolio"],
    fields: [
      { name: "name", label: "Skill", type: "text", required: true },
      { name: "category", label: "Category", type: "datalist", options: SKILL_CATEGORIES },
      {
        name: "level",
        label: "Proficiency (0–100 %)",
        type: "number",
        help: "Drives both the percentage readout and the bar width.",
      },
      {
        name: "icon",
        label: "Logo (simple-icons slug)",
        type: "text",
        placeholder: "react, nextdotjs, postgresql…",
        help: "Leave blank to guess from the skill name.",
      },
      {
        name: "iconImage",
        label: "Custom logo (fallback)",
        type: "image",
        full: true,
        help: "Only needed when the icon library has no mark for this tool.",
      },
      { name: "order", label: "Order", type: "number" },
    ],
  },

  experience: {
    slug: "experience",
    label: "Experience entry",
    plural: "Experience",
    model: "experience",
    primaryField: "role",
    secondaryFields: ["org", "period"],
    orderBy: { order: "asc" },
    revalidate: ["/story", "/portfolio"],
    fields: [
      { name: "role", label: "Role", type: "text", required: true },
      { name: "org", label: "Organisation", type: "text", required: true },
      { name: "period", label: "Period", type: "text", placeholder: "Jul 2024 — Nov 2024" },
      { name: "location", label: "Location", type: "text", placeholder: "Cairo, Egypt" },
      {
        name: "summary",
        label: "Short summary (timeline card)",
        type: "textarea",
        help: "Two or three sentences — all the card shows.",
      },
      {
        name: "description",
        label: "Full detail (popup)",
        type: "textarea",
        help: "Shown only when the card is opened. Blank line separates paragraphs.",
      },
      { name: "achievements", label: "Highlights (one per line)", type: "lines", full: true },
      { name: "stack", label: "Stack used", type: "tags", full: true },
      { name: "image", label: "Image (optional)", type: "image", full: true },
      { name: "order", label: "Order", type: "number" },
    ],
  },

  achievements: {
    slug: "achievements",
    label: "Achievement",
    plural: "Achievements",
    model: "achievement",
    primaryField: "title",
    secondaryFields: ["category", "date"],
    orderBy: { order: "asc" },
    revalidate: ["/portfolio", "/achievements"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "slug",
        label: "Slug",
        type: "text",
        placeholder: "auto from the title if left blank",
        help: "URL segment — /achievements/<slug>",
      },
      { name: "category", label: "Category", type: "text", placeholder: "Award, Talk, Hackathon" },
      { name: "date", label: "Date", type: "text", placeholder: "Mar 2024" },
      { name: "location", label: "Location", type: "text" },
      { name: "role", label: "My role", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      {
        name: "image",
        label: "Lead image",
        type: "image",
        full: true,
        help: "The single shot used on the achievements grid and at the top of the detail page.",
      },
      {
        name: "workMedia",
        label: "Gallery — The Work",
        type: "gallery",
        full: true,
        help: "Boards, drawings, models — the submitted entry itself.",
      },
      {
        name: "eventMedia",
        label: "Gallery — The Event",
        type: "gallery",
        full: true,
        help: "The venue, the team, the presentation, the ceremony. A separate set from The Work.",
      },
      { name: "tags", label: "Tags", type: "tags", full: true },
      { name: "order", label: "Order", type: "number" },
    ],
  },

  identity: {
    slug: "identity",
    label: "Identity moment",
    plural: "Identity moments",
    model: "identityMoment",
    primaryField: "title",
    secondaryFields: ["year", "category"],
    orderBy: { order: "asc" },
    revalidate: ["/identity"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "year", label: "Year", type: "text", placeholder: "2019" },
      {
        name: "category",
        label: "Category",
        type: "datalist",
        options: ["Practice", "Material", "Place", "Influence", "Method"],
        placeholder: "Practice",
        help: "Groups the moment on /identity. Pick an existing one or type a new one — the public filter lists only categories actually in use.",
      },
      {
        name: "teaser",
        label: "Short teaser (card)",
        type: "textarea",
        help: "One or two sentences — all the card shows.",
      },
      { name: "description", label: "Full detail (popup)", type: "textarea" },
      { name: "image", label: "Image", type: "image", full: true },
      { name: "order", label: "Order", type: "number" },
    ],
  },

  ventures: {
    slug: "ventures",
    label: "Venture",
    plural: "Ventures",
    model: "venture",
    primaryField: "name",
    secondaryFields: ["status", "jurisdiction"],
    orderBy: { order: "asc" },
    revalidate: ["/business"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["Exploring", "Researching", "Active", "Shelved"],
      },
      { name: "jurisdiction", label: "Jurisdiction", type: "text", placeholder: "Egypt" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Image", type: "image", full: true },
      { name: "order", label: "Order", type: "number" },
    ],
  },

  misc: {
    slug: "misc",
    label: "Misc entry",
    plural: "Misc entries",
    model: "miscEntry",
    primaryField: "title",
    secondaryFields: ["emoji"],
    orderBy: { order: "asc" },
    revalidate: ["/misc"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "emoji", label: "Emoji", type: "text", placeholder: "📚" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Image", type: "image", full: true },
      { name: "order", label: "Order", type: "number" },
    ],
  },

  now: {
    slug: "now",
    label: "Now entry",
    plural: "Now entries",
    model: "nowEntry",
    primaryField: "text",
    secondaryFields: ["date", "active"],
    orderBy: { date: "desc" },
    revalidate: ["/", "/now"],
    fields: [
      {
        name: "text",
        label: "What's happening",
        type: "textarea",
        required: true,
        full: true,
        help: "The line shown on the card and in the ticker. Keep it short.",
      },
      {
        name: "details",
        label: "Full detail (popup)",
        type: "textarea",
        full: true,
        help: "Optional. An entry with detail opens a popup when clicked; one without stays a plain card. Blank line separates paragraphs.",
      },
      { name: "date", label: "Date", type: "date" },
      {
        name: "image",
        label: "Image (optional)",
        type: "image",
        full: true,
        help: "Optional. Nothing is rendered on /now when this is empty.",
      },
      {
        name: "active",
        label: "Show in the telemetry ticker",
        type: "toggle",
        help: "Inactive entries stay on /now but drop out of the ticker.",
      },
    ],
  },

  books: {
    slug: "books",
    label: "Book",
    plural: "Books",
    model: "book",
    primaryField: "title",
    secondaryFields: ["country", "category", "status"],
    orderBy: { order: "asc" },
    revalidate: ["/books"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "country",
        label: "Country",
        type: "text",
        help: "Country of origin or publication — for a code or standard, the jurisdiction it applies to.",
      },
      {
        name: "category",
        label: "Category",
        type: "select",
        // Raw enum values, as with project status above — this file stays
        // import-free and serialisable, and the select renders values as-is.
        options: ["GENERAL", "CODES_AND_STANDARDS"],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["FINISHED", "READING"],
      },
      { name: "coverImage", label: "Cover image", type: "image", full: true },
      {
        name: "highlights",
        label: "Highlights",
        type: "list",
        full: true,
        placeholder: "A line from the book worth keeping.",
        help: "Standout sentences, one per row. Rendered as pulled quotes.",
      },
      {
        name: "takeaway",
        label: "What I took from it",
        type: "textarea",
        help: "What you actually got out of it — not a summary of the book.",
      },
      { name: "order", label: "Order", type: "number" },
    ],
  },

  certifications: {
    slug: "certifications",
    label: "Certification",
    plural: "Certifications",
    model: "certification",
    primaryField: "title",
    secondaryFields: ["issuer", "date"],
    orderBy: { order: "asc" },
    revalidate: ["/certifications", "/portfolio"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "issuer", label: "Issuer", type: "text", placeholder: "Coursera, AWS, …" },
      { name: "date", label: "Date earned", type: "text", placeholder: "Mar 2024" },
      {
        name: "sourceUrl",
        label: "Verification link",
        type: "text",
        full: true,
        placeholder: "https://…",
        help: "Optional. The card links out to this when set.",
      },
      { name: "image", label: "Certificate image", type: "image", full: true },
      { name: "order", label: "Order", type: "number" },
    ],
  },

  inbox: {
    slug: "inbox",
    label: "Message",
    plural: "Inbox",
    model: "contactMessage",
    primaryField: "subject",
    secondaryFields: ["name", "email", "createdAt"],
    orderBy: { createdAt: "desc" },
    revalidate: [],
    readOnly: true,
    fields: [],
  },
};

export const MODEL_SLUGS = Object.keys(MODELS);
