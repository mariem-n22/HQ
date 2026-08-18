"use client";

import { useReducedMotion } from "framer-motion";
import { skillIcon } from "@/lib/skill-icons";
import type { Skill } from "@/lib/data";
import { Reveal } from "./Reveal";

/**
 * Proficiency is stored 0-100. Older rows used a 1-5 scale; the v4 migration
 * lifts them, but clamp here too so a stray legacy row renders a sane bar
 * instead of a 4% sliver.
 */
export function percentOf(raw: number) {
  const n = Number(raw) || 0;
  const scaled = n > 0 && n <= 5 ? n * 20 : n;
  return Math.min(100, Math.max(0, Math.round(scaled)));
}

/** Category order from the old portfolio; anything unrecognised sorts last. */
const CATEGORY_ORDER = [
  "Frontend",
  "Backend",
  "Databases",
  "DevOps",
  "AI/ML",
  "CMS/E-commerce",
  "Tools",
];

function categoryRank(category: string) {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function SkillRow({ skill }: { skill: Skill }) {
  const Icon = skillIcon(skill);
  const percent = percentOf(skill.level);
  const reduced = useReducedMotion();

  return (
    <li>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-raised/60 text-cyan"
        >
          {Icon ? (
            <Icon className="h-4 w-4" />
          ) : (
            <span className="font-mono text-[10px] uppercase text-mute">
              {skill.name.slice(0, 2)}
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-ink">{skill.name}</span>
        <span className="data-mono shrink-0 text-[11px] tracking-widest">{percent}%</span>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-raised"
        role="img"
        aria-label={`${skill.name}: ${percent} percent`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan to-amber"
          style={{
            width: `${percent}%`,
            transition: reduced ? undefined : "width 0.8s cubic-bezier(0.2, 0.7, 0.2, 1)",
          }}
        />
      </div>
    </li>
  );
}

/**
 * The one skills implementation — rendered identically on /skills and inside
 * /portfolio. Groups by category, each group a glow card of icon + percentage
 * bar rows.
 */
export function SkillStack({ skills, className = "" }: { skills: Skill[]; className?: string }) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    (acc[skill.category] ||= []).push(skill);
    return acc;
  }, {});

  const categories = Object.entries(grouped).sort(
    ([a], [b]) => categoryRank(a) - categoryRank(b) || a.localeCompare(b),
  );

  return (
    <div className={`grid gap-5 md:grid-cols-2 xl:grid-cols-3 ${className}`}>
      {categories.map(([category, items], i) => (
        <Reveal key={category} delay={Math.min(i, 5) * 0.06} className="h-full">
          <section className="glow-card h-full p-5">
            <h3 className="label-mono text-cyan">{category}</h3>
            <ul className="mt-4 space-y-3.5">
              {items
                .slice()
                .sort((a, b) => percentOf(b.level) - percentOf(a.level))
                .map((skill) => (
                  <SkillRow key={skill.id} skill={skill} />
                ))}
            </ul>
          </section>
        </Reveal>
      ))}
    </div>
  );
}
