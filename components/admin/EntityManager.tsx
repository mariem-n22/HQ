"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import { saveEntity, deleteEntity } from "@/lib/admin/actions";
import type { Field, ModelConfig } from "@/lib/admin/config";
import { ImageField } from "./ImageField";

type Row = Record<string, unknown> & { id: string };

const inputClass =
  "mt-2 w-full rounded-sm border border-line bg-base px-3 py-2 text-sm text-ink placeholder:text-mute/50 focus:border-amber focus:outline-none";

/** Render a stored value into the string the input expects. */
function toInput(field: Field, value: unknown): string {
  if (value === null || value === undefined) return "";
  if (field.type === "tags") return Array.isArray(value) ? value.join(", ") : "";
  if (field.type === "lines") return Array.isArray(value) ? value.join("\n") : "";
  if (field.type === "date") {
    const d = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  }
  return String(value);
}

function FieldInput({ field, row }: { field: Field; row: Row | null }) {
  const value = row ? row[field.name] : undefined;
  const defaultValue = toInput(field, value);

  if (field.type === "image") {
    return <ImageField name={field.name} initial={defaultValue} label={field.label} />;
  }

  if (field.type === "links") {
    const links = (value ?? {}) as Record<string, string>;
    return (
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {(["live", "github", "other"] as const).map((key) => (
          <label key={key} className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
              {key}
            </span>
            <input
              type="url"
              name={`links.${key}`}
              defaultValue={links?.[key] ?? ""}
              placeholder="https://…"
              className={inputClass}
            />
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "toggle") {
    return (
      <span className="mt-2 flex items-center gap-3">
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={Boolean(value)}
          className="h-4 w-4 accent-amber"
        />
        <span className="text-sm text-mute">Enabled</span>
      </span>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        name={field.name}
        rows={field.name === "description" ? 8 : 4}
        defaultValue={defaultValue}
        placeholder={field.placeholder}
        className={inputClass}
      />
    );
  }

  if (field.type === "lines") {
    return (
      <textarea
        name={field.name}
        rows={5}
        defaultValue={defaultValue}
        placeholder={field.placeholder ?? "One per line"}
        className={inputClass}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select name={field.name} defaultValue={defaultValue} className={inputClass}>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "datalist") {
    return (
      <>
        <input
          type="text"
          name={field.name}
          list={`${field.name}-options`}
          defaultValue={defaultValue}
          placeholder={field.placeholder}
          className={inputClass}
        />
        <datalist id={`${field.name}-options`}>
          {field.options?.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      name={field.name}
      defaultValue={defaultValue}
      placeholder={field.placeholder}
      {...(field.type === "number" && field.name === "level" ? { min: 0, max: 100 } : {})}
      className={inputClass}
    />
  );
}

export function EntityManager({ config, rows }: { config: ModelConfig; rows: Row[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function startCreate() {
    setEditing(null);
    setError("");
    setOpen(true);
  }

  function startEdit(row: Row) {
    setEditing(row);
    setError("");
    setOpen(true);
  }

  async function onSubmit(formData: FormData) {
    setError("");
    const result = await saveEntity(config.slug, editing?.id ?? null, formData);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    setEditing(null);
    startTransition(() => router.refresh());
  }

  function onDelete(row: Row) {
    const name = String(row[config.primaryField] ?? "this item");
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteEntity(config.slug, row.id);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="label-mono">
          {rows.length} {rows.length === 1 ? config.label.toLowerCase() : config.plural.toLowerCase()}
        </p>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 rounded-sm border border-amber bg-amber px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-base"
        >
          <Plus aria-hidden className="h-3.5 w-3.5" />
          Add {config.label.toLowerCase()}
        </button>
      </div>

      {error ? (
        <p role="alert" className="rounded-sm border border-signal/60 px-4 py-3 text-sm text-signal">
          {error}
        </p>
      ) : null}

      {open ? (
        <form action={onSubmit} className="glow-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="label-mono text-amber">
              {editing ? `Edit ${config.label.toLowerCase()}` : `New ${config.label.toLowerCase()}`}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close form"
              className="rounded-sm border border-line p-1.5 text-mute hover:border-amber hover:text-amber"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {config.fields.map((field) => (
              <label
                key={field.name}
                className={`block ${field.full || field.type === "textarea" || field.type === "lines" ? "md:col-span-2" : ""}`}
              >
                <span className="label-mono">
                  {field.label}
                  {field.required ? <span className="text-signal"> *</span> : null}
                </span>
                <FieldInput field={field} row={editing} />
                {field.help ? <span className="mt-1.5 block text-xs text-mute">{field.help}</span> : null}
              </label>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-sm border border-amber bg-amber px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-base disabled:opacity-60"
            >
              {editing ? "Save changes" : `Add ${config.label.toLowerCase()}`}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-sm border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">
                {String(row[config.primaryField] ?? "—")}
              </p>
              <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                {config.secondaryFields
                  .map((f) => {
                    const v = row[f];
                    if (v === null || v === undefined || v === "") return null;
                    if (v instanceof Date) return v.toISOString().slice(0, 10);
                    if (typeof v === "boolean") return v ? f : null;
                    return String(v);
                  })
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => startEdit(row)}
                className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute hover:border-amber hover:text-amber"
              >
                <Pencil aria-hidden className="h-3 w-3" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(row)}
                className="inline-flex items-center gap-1.5 rounded-sm border border-signal/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-signal hover:bg-signal hover:text-ink"
              >
                <Trash2 aria-hidden className="h-3 w-3" />
                Delete
              </button>
            </div>
          </li>
        ))}
        {rows.length === 0 ? (
          <li className="rounded-sm border border-dashed border-line bg-surface p-8 text-center text-sm text-mute">
            Nothing here yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
