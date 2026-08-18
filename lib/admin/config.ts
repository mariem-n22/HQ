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
  | "image"
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
    secondaryFields: ["status", "year", "slug"],
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
        name: "tagline",
        label: "Short description (cards)",
        type: "text",
        full: true,
        help: "The one line shown on /work cards and the portfolio slider.",
      },
      {
        name: "description",
        label: "Full description (detail page)",
        type: "textarea",
        help: "Long form, shown only on /work/<slug>. Blank line separates paragraphs.",
      },
      { name: "role", label: "My role", type: "text", placeholder: "Full-stack developer" },
      {
        name: "company",
        label: "Company / client",
        type: "text",
        placeholder: "owais.media",
        help: "Who it was built for, if anyone.",
      },
      { name: "location", label: "Location", type: "text", placeholder: "Cairo, Egypt" },
      {
        name: "period",
        label: "Timeframe",
        type: "text",
        placeholder: "Jul 2024 — Nov 2024",
        help: "Full range shown on the detail page.",
      },
      {
        name: "year",
        label: "Year (card badge)",
        type: "text",
        placeholder: "2024",
        help: "The compact value in the card badge, next to the status.",
      },
      { name: "stack", label: "Skills / stack used", type: "tags", full: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["BUILDING", "SHIPPED", "ARCHIVED"],
      },
      { name: "emoji", label: "Emoji", type: "text", placeholder: "🚗" },
      { name: "coverImage", label: "Cover image", type: "image", full: true },
      { name: "links", label: "Links", type: "links", full: true },
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
    revalidate: ["/portfolio"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "text", placeholder: "Award, Talk, Hackathon" },
      { name: "date", label: "Date", type: "text", placeholder: "Mar 2024" },
      { name: "location", label: "Location", type: "text" },
      { name: "role", label: "My role", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Image", type: "image", full: true },
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
    secondaryFields: ["year"],
    orderBy: { order: "asc" },
    revalidate: ["/identity"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "year", label: "Year", type: "text", placeholder: "2019" },
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
      { name: "text", label: "What's happening", type: "textarea", required: true, full: true },
      { name: "date", label: "Date", type: "date" },
      {
        name: "active",
        label: "Show in the telemetry ticker",
        type: "toggle",
        help: "Inactive entries stay on /now but drop out of the ticker.",
      },
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
