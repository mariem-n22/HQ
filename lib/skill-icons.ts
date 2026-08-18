import type { IconType } from "react-icons";
import { FaAws } from "react-icons/fa6";
import { RiOpenaiFill } from "react-icons/ri";
import {
  SiCelery,
  SiDjango,
  SiDocker,
  SiExpress,
  SiFastapi,
  SiFigma,
  SiGit,
  SiGooglecloud,
  SiGraphql,
  SiHostinger,
  SiKubernetes,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRedis,
  SiShopify,
  SiTailwindcss,
  SiTensorflow,
  SiTypescript,
  SiVercel,
  SiWordpress,
} from "react-icons/si";

/**
 * Brand marks for the skill meters. Keyed by simple-icons slug (what the
 * `skills.icon` column stores) plus the obvious shorthands, so a skill still
 * finds its logo when the column is empty and we fall back to the name.
 *
 * AWS and OpenAI are not in simple-icons v5 — they come from Font Awesome and
 * Remix Icon respectively.
 */
const ICONS: Record<string, IconType> = {
  react: SiReact,
  nextdotjs: SiNextdotjs,
  nextjs: SiNextdotjs,
  next: SiNextdotjs,
  typescript: SiTypescript,
  ts: SiTypescript,
  tailwindcss: SiTailwindcss,
  tailwind: SiTailwindcss,
  nodedotjs: SiNodedotjs,
  nodejs: SiNodedotjs,
  node: SiNodedotjs,
  express: SiExpress,
  python: SiPython,
  django: SiDjango,
  fastapi: SiFastapi,
  celery: SiCelery,
  graphql: SiGraphql,
  mongodb: SiMongodb,
  mongo: SiMongodb,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  redis: SiRedis,
  docker: SiDocker,
  kubernetes: SiKubernetes,
  k8s: SiKubernetes,
  amazonwebservices: FaAws,
  aws: FaAws,
  googlecloud: SiGooglecloud,
  gcp: SiGooglecloud,
  hostinger: SiHostinger,
  tensorflow: SiTensorflow,
  openai: RiOpenaiFill,
  openaiapi: RiOpenaiFill,
  wordpress: SiWordpress,
  shopify: SiShopify,
  git: SiGit,
  figma: SiFigma,
  vercel: SiVercel,
};

/** "Next.js" → "nextjs", "OpenAI API" → "openaiapi" */
export function slugifySkill(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Explicit `icon` slug wins; otherwise guess from the skill name. Returns null
 * when nothing matches so the caller can render a lettered fallback badge.
 */
export function skillIcon(skill: { name: string; icon?: string | null }): IconType | null {
  const explicit = slugifySkill(skill.icon ?? "");
  if (explicit && ICONS[explicit]) return ICONS[explicit];
  return ICONS[slugifySkill(skill.name)] ?? null;
}

/** Slugs offered as autocomplete in the dashboard icon field. */
export const ICON_SLUGS = Object.keys(ICONS).sort();
