"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageField } from "./ImageField";
import { SaveButton, type SaveState } from "./SaveButton";
import { saveArchitect, savePhilosophy } from "@/lib/admin/studio-actions";

const inputClass =
  "mt-2 w-full rounded-sm border border-line-strong bg-base px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-amber focus:outline-none";

function useSaver(action: (form: FormData) => Promise<{ ok: boolean; error?: string }>) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState("saving");
    setError(null);
    start(async () => {
      const result = await action(form);
      if (result.ok) {
        setState("saved");
        router.refresh();
      } else {
        setState("error");
        setError(result.error ?? "Save failed.");
      }
    });
  }

  return { state, error, pending, onSubmit, settle: () => setState("idle") };
}

export function ArchitectForm({
  initial,
}: {
  initial: { name: string; roleLine: string; portrait: string; biography: string; credentials: string[] };
}) {
  const { state, error, onSubmit, settle } = useSaver(saveArchitect);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <p role="alert" className="rounded-sm border border-signal/60 px-4 py-3 text-sm text-signal">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="label-mono">Name</span>
          <input name="name" defaultValue={initial.name} className={inputClass} placeholder="Mariem …" />
        </label>
        <label className="block">
          <span className="label-mono">Role line</span>
          <input
            name="roleLine"
            defaultValue={initial.roleLine}
            className={inputClass}
            placeholder="Architect / Founder"
          />
        </label>
      </div>

      <div>
        <span className="label-mono">Portrait</span>
        <ImageField name="portrait" initial={initial.portrait} label="Portrait" />
      </div>

      <label className="block">
        <span className="label-mono">Biography</span>
        <p className="mt-1 text-xs text-mute">
          Editorial, not a CV. Enough for a client or selection committee to understand the practice in
          under a minute — background, and what the practice actually does. Blank line separates
          paragraphs. Three or four short paragraphs is the intended ceiling.
        </p>
        <textarea
          name="biography"
          defaultValue={initial.biography}
          rows={10}
          className={inputClass}
          placeholder="Leave blank until the real text is written."
        />
      </label>

      <label className="block">
        <span className="label-mono">Credentials</span>
        <p className="mt-1 text-xs text-mute">
          One per line — education, prior practice, licensure. A line or two total, not a resume.
        </p>
        <textarea
          name="credentials"
          defaultValue={initial.credentials.join("\n")}
          rows={4}
          className={inputClass}
          placeholder={"M.Arch, …\nPreviously at …"}
        />
      </label>

      <SaveButton state={state} idleLabel="Save profile" onSettled={settle} />
    </form>
  );
}

export function PhilosophyForm({ initial }: { initial: { statement: string; body: string } }) {
  const { state, error, onSubmit, settle } = useSaver(savePhilosophy);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <p role="alert" className="rounded-sm border border-signal/60 px-4 py-3 text-sm text-signal">
          {error}
        </p>
      ) : null}

      <label className="block">
        <span className="label-mono">Statement</span>
        <p className="mt-1 text-xs text-mute">
          The manifesto line. A few sentences that read like a pull-quote, not an essay — this is set
          large and is the whole point of the page.
        </p>
        <textarea
          name="statement"
          defaultValue={initial.statement}
          rows={5}
          className={inputClass}
          placeholder="Leave blank until the real text is written."
        />
      </label>

      <label className="block">
        <span className="label-mono">Supporting text</span>
        <p className="mt-1 text-xs text-mute">
          Optional. A short elaboration beneath the statement. Blank line separates paragraphs.
        </p>
        <textarea name="body" defaultValue={initial.body} rows={8} className={inputClass} />
      </label>

      <SaveButton state={state} idleLabel="Save philosophy" onSettled={settle} />
    </form>
  );
}
