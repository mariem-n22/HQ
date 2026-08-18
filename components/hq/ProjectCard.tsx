import Link from "next/link";
import type { Project } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { Frame } from "./Frame";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-sm border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-amber hover:shadow-[0_18px_40px_-24px_var(--color-amber)]"
    >
      <Frame
        src={project.coverImage}
        alt={`${project.title} cover`}
        ratio="16/10"
        tone={false}
        className="border-0 border-b border-line [&_img]:transition-transform [&_img]:duration-500 [&_img]:group-hover:scale-[1.05]"
      />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <StatusBadge status={project.status} />
          <span className="label-mono">{project.year}</span>
        </div>
        <div>
          <h3 className="display-title text-3xl text-ink transition-colors group-hover:text-amber">
            {project.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-mute">{project.tagline}</p>
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {project.stack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded-sm border border-line bg-raised/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-mute"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
