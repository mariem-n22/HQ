"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { submitContact } from "@/lib/contact-action";

type Fields = { name: string; email: string; subject: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const blank: Fields = { name: "", email: "", subject: "", message: "" };

const inputClass =
  "mt-2 w-full rounded-md border border-line-strong bg-base px-3 py-2.5 text-sm text-ink placeholder:text-mute focus:border-amber focus:outline-none";

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Tell me who you are.";
  if (!values.email.trim()) errors.email = "I need an address to reply to.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "That address doesn't look right.";
  if (!values.subject.trim()) errors.subject = "A one-line subject helps.";
  if (!values.message.trim()) errors.message = "The message is empty.";
  else if (values.message.trim().length < 10) errors.message = "A little more detail, please.";
  return errors;
}

/**
 * Client shell around the submitContact Server Action — the action does the
 * authoritative validation, this mirrors it for instant feedback.
 */
export function ContactForm() {
  const [values, setValues] = useState<Fields>(blank);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [failure, setFailure] = useState("");

  const set = (key: keyof Fields, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    const body = new FormData();
    for (const [key, value] of Object.entries(values)) body.append(key, value.trim());
    const result = await submitContact(null, body);

    if (!result.ok) {
      setStatus("error");
      setFailure(result.error);
      return;
    }
    setStatus("sent");
    setValues(blank);
  }

  if (status === "sent") {
    return (
      <div className="glow-card p-8 text-center" role="status">
        <p className="display-title text-3xl text-ink">Message sent.</p>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          It landed. I typically respond within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-md border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute transition-colors hover:border-amber hover:text-amber"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="glow-card p-6 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Your Name"
          value={values.name}
          error={errors.name}
          placeholder="John Doe"
          onChange={(v) => set("name", v)}
        />
        <Field
          id="email"
          label="Your Email"
          type="email"
          value={values.email}
          error={errors.email}
          placeholder="john@example.com"
          onChange={(v) => set("email", v)}
        />
      </div>

      <div className="mt-5">
        <Field
          id="subject"
          label="Subject"
          value={values.subject}
          error={errors.subject}
          placeholder="Project inquiry / collaboration / job opportunity"
          onChange={(v) => set("subject", v)}
        />
      </div>

      <div className="mt-5">
        <label htmlFor="message" className="label-mono">
          Message <span className="text-signal">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          value={values.message}
          placeholder="Tell me about your project or how I can help…"
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${inputClass} ${errors.message ? "border-signal" : ""}`}
        />
        {errors.message ? (
          <p id="message-error" className="mt-1.5 text-xs text-signal">
            {errors.message}
          </p>
        ) : null}
      </div>

      {status === "error" ? (
        <p
          role="alert"
          className="mt-5 rounded-md border border-signal/60 bg-signal/10 px-4 py-3 text-xs text-signal"
        >
          {failure || "That didn't send. Try again, or reach me on WhatsApp."}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 rounded-md border border-amber bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-base transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Send aria-hidden className="h-3.5 w-3.5" />
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        <p className="font-mono text-[10px] tracking-wide text-mute">
          I typically respond within 24 hours.
        </p>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  error,
  placeholder,
  type = "text",
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string | undefined;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="label-mono">
        {label} <span className="text-signal">*</span>
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClass} ${error ? "border-signal" : ""}`}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-signal">
          {error}
        </p>
      ) : null}
    </div>
  );
}
