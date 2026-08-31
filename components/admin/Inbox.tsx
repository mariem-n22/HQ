"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { deleteEntity, setMessageRead } from "@/lib/admin/actions";

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

/**
 * Contact-form submissions. Read-focused: there is no create or edit, because
 * these arrive from the public form — only mark read/unread and delete.
 */
export function Inbox({ rows }: { rows: Message[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const unread = rows.filter((r) => !r.readAt).length;

  function toggleRead(row: Message) {
    startTransition(async () => {
      const result = await setMessageRead(row.id, !row.readAt);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  function remove(row: Message) {
    if (!window.confirm(`Delete the message from ${row.name}? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteEntity("inbox", row.id);
      if (!result.ok) setError(result.error);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <p className="label-mono">
        {rows.length} message{rows.length === 1 ? "" : "s"}
        {unread > 0 ? ` · ${unread} unread` : ""}
      </p>

      {error ? (
        <p role="alert" className="rounded-sm border border-signal/60 px-4 py-3 text-sm text-signal">
          {error}
        </p>
      ) : null}

      <ul className="space-y-2">
        {rows.map((row) => {
          const isOpen = openId === row.id;
          return (
            <li key={row.id} className={row.readAt ? "panel p-4" : "glow-card p-4"}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : row.id)}
                  aria-expanded={isOpen}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="flex items-center gap-2 truncate text-sm text-ink">
                    {row.readAt ? null : (
                      <span aria-label="Unread" className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                    )}
                    {row.subject || "(no subject)"}
                  </p>
                  <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                    {row.name} · {row.email} · {row.createdAt.slice(0, 10)}
                  </p>
                </button>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRead(row)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute hover:border-amber hover:text-amber"
                  >
                    {row.readAt ? (
                      <>
                        <Mail aria-hidden className="h-3 w-3" /> Unread
                      </>
                    ) : (
                      <>
                        <MailOpen aria-hidden className="h-3 w-3" /> Read
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(row)}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-signal/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-signal hover:bg-signal hover:text-on-signal"
                  >
                    <Trash2 aria-hidden className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>

              {isOpen ? (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
                    {row.message}
                  </p>
                  <a
                    href={`mailto:${row.email}?subject=Re: ${encodeURIComponent(row.subject)}`}
                    className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-amber hover:underline"
                  >
                    Reply by email →
                  </a>
                </div>
              ) : null}
            </li>
          );
        })}
        {rows.length === 0 ? (
          <li className="rounded-sm border border-dashed border-line bg-surface p-8 text-center text-sm text-mute">
            No messages yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
