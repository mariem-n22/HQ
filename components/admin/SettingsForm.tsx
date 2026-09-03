"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, Trash2, Upload } from "lucide-react";
import { GalleryField, type GalleryItem } from "./GalleryField";
import { ImageField } from "./ImageField";
import { saveSettings, setCv, clearCv } from "@/lib/admin/settings-actions";
import { SaveButton, type SaveState } from "./SaveButton";

const inputClass =
  "mt-2 w-full rounded-sm border border-line-strong bg-base px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-amber focus:outline-none";

type Settings = {
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  github: string;
  instagram: string;
  location: string;
  availability: string;
  philosophyQuote: string;
  homeHeroUrl: string;
  homeHeroCredit: string;
  signatureStatement: string;
  locations: string[];
  statementHeadline: string;
  statementBody: string;
  practiceHeadline: string;
  practiceBody: string;
  practiceDisciplines: string[];
  practiceImage: string;
  openToOpportunities: boolean;
  avatarImage: string;
  heroImage: string;
  cvUrl: string;
  cvUpdatedAt: string | null;
};

const CHANNELS: { name: keyof Settings; label: string; placeholder?: string }[] = [
  { name: "email", label: "Email", placeholder: "you@domain.com" },
  { name: "phone", label: "Phone", placeholder: "+20 105 5210373" },
  { name: "whatsapp", label: "WhatsApp link", placeholder: "https://wa.me/201055210373" },
  { name: "linkedin", label: "LinkedIn URL" },
  { name: "github", label: "GitHub URL" },
  { name: "instagram", label: "Instagram URL" },
  { name: "location", label: "Location", placeholder: "Egypt — open to remote" },
  { name: "availability", label: "Availability line" },
];

export function SettingsForm({
  settings,
  heroImages,
}: {
  settings: Settings;
  heroImages: GalleryItem[];
}) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  // CV upload is its own flow — it replaces a file in storage rather than
  // editing a text field, so it saves immediately instead of on form submit.
  const [cvUrl, setCvUrl] = useState(settings.cvUrl);
  const [cvBusy, setCvBusy] = useState(false);
  const [cvNote, setCvNote] = useState("");
  const cvRef = useRef<HTMLInputElement>(null);

  async function onSubmit(formData: FormData) {
    setError("");
    setSaveState("saving");
    const result = await saveSettings(formData);
    if (!result.ok) {
      setError(result.error);
      setSaveState("error");
      return;
    }
    setSaveState("saved");
    startTransition(() => router.refresh());
  }

  async function uploadCv(file: File) {
    if (file.type !== "application/pdf") {
      setCvNote("The CV must be a PDF.");
      return;
    }
    setCvBusy(true);
    setCvNote("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", "pdf");
      // Tells the upload route which old file to delete once this one lands.
      if (cvUrl) body.append("replaces", cvUrl);

      const res = await fetch("/api/upload", { method: "POST", body });
      const json = (await res.json()) as { url?: string; error?: string; replacedOld?: boolean | null };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed.");

      const saved = await setCv(json.url);
      if (!saved.ok) throw new Error(saved.error);

      setCvUrl(json.url);
      setCvNote(
        json.replacedOld === true
          ? "Uploaded. The previous CV file was deleted from storage."
          : json.replacedOld === false
            ? "Uploaded, but the old file could not be deleted — check Blob storage."
            : "Uploaded.",
      );
      startTransition(() => router.refresh());
    } catch (e) {
      setCvNote(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setCvBusy(false);
    }
  }

  async function removeCv() {
    if (!window.confirm("Remove the CV? The stored file will be deleted.")) return;
    setCvBusy(true);
    const result = await clearCv();
    setCvBusy(false);
    if (!result.ok) {
      setCvNote(result.error);
      return;
    }
    setCvUrl("");
    setCvNote("CV removed and the file deleted.");
    startTransition(() => router.refresh());
  }

  return (
    <form action={onSubmit} className="space-y-8">
      {error ? (
        <p role="alert" className="rounded-sm border border-signal/60 px-4 py-3 text-sm text-signal">
          {error}
        </p>
      ) : null}
      <section className="glow-card p-5 sm:p-6">
        <p className="label-mono text-amber">Hero gallery</p>
        <p className="mt-2 text-xs text-mute">
          Portrait images for the hero slot on /portfolio. The first image shows by default and
          visitors can page through the rest. With none set, the placeholder frame is shown.
        </p>
        <GalleryField name="heroImages" initial={heroImages} />
      </section>

      <section className="glow-card p-5 sm:p-6">
        <p className="label-mono text-amber">CV</p>
        <p className="mt-2 text-xs text-mute">
          PDF only. Uploading a new one deletes the previous file — there is one current CV, not a
          version history.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => cvRef.current?.click()}
            disabled={cvBusy}
            className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute hover:border-amber hover:text-amber disabled:opacity-50"
          >
            <Upload aria-hidden className="h-3 w-3" />
            {cvBusy ? "Working…" : cvUrl ? "Replace CV" : "Upload CV"}
          </button>

          {cvUrl ? (
            <>
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink hover:border-amber"
              >
                <FileText aria-hidden className="h-3 w-3" />
                View current
              </a>
              <button
                type="button"
                onClick={removeCv}
                disabled={cvBusy}
                className="inline-flex items-center gap-1.5 rounded-sm border border-signal/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-signal hover:bg-signal hover:text-on-signal disabled:opacity-50"
              >
                <Trash2 aria-hidden className="h-3 w-3" />
                Remove
              </button>
            </>
          ) : (
            <span className="text-xs text-mute">No CV uploaded yet.</span>
          )}
        </div>

        {settings.cvUpdatedAt && cvUrl ? (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
            Last updated {settings.cvUpdatedAt.slice(0, 10)}
          </p>
        ) : null}
        {cvNote ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-mute">
            <Check aria-hidden className="h-3 w-3 text-go" />
            {cvNote}
          </p>
        ) : null}

        <input
          ref={cvRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadCv(file);
            e.target.value = "";
          }}
        />
      </section>

      <section className="glow-card p-5 sm:p-6">
        <p className="label-mono text-amber">Images</p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="label-mono">Portrait / avatar (fallback)</span>
            <ImageField name="avatarImage" initial={settings.avatarImage} label="Portrait" />
          </label>
          <label className="block">
            <span className="label-mono">Hero image (single, legacy)</span>
            <ImageField name="heroImage" initial={settings.heroImage} label="Hero" />
          </label>
        </div>
      </section>

      <section className="glow-card p-5 sm:p-6">
        <p className="label-mono text-amber">Channels</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {CHANNELS.map((field) => (
            <label key={field.name} className="block">
              <span className="label-mono">{field.label}</span>
              <input
                name={field.name}
                defaultValue={String(settings[field.name] ?? "")}
                placeholder={field.placeholder}
                className={inputClass}
              />
            </label>
          ))}
        </div>

        <label className="mt-5 flex items-center gap-3">
          <input
            type="checkbox"
            name="openToOpportunities"
            defaultChecked={settings.openToOpportunities}
            className="h-4 w-4 accent-amber"
          />
          <span className="text-sm text-ink">Open to opportunities</span>
        </label>

      </section>

      <section className="glow-card p-5 sm:p-6">
        <h2 className="label-mono text-amber">Home page</h2>
        <p className="mt-2 text-xs text-mute">
          The hero and the statement beneath it. Both statements should be the architect&rsquo;s own
          words — the page shows an obvious placeholder until they are filled in, rather than any
          stand-in copy.
        </p>

        <div className="mt-5">
          <span className="label-mono">Hero media</span>
          <p className="mt-1 text-xs text-mute">
            One image or video, filling the first screen. Video autoplays muted and loops.
          </p>
          <ImageField
            name="homeHeroUrl"
            initial={settings.homeHeroUrl}
            label="Hero media"
            allowVideo
          />
        </div>

        <label className="mt-5 block">
          <span className="label-mono">Hero credit</span>
          <p className="mt-1 text-xs text-mute">
            Shown small in the hero corner. Required if the image&rsquo;s licence asks for
            attribution; otherwise use it to credit the photographer.
          </p>
          <input
            name="homeHeroCredit"
            defaultValue={settings.homeHeroCredit}
            className={inputClass}
            placeholder="Photograph by …"
          />
        </label>

        <label className="mt-5 block">
          <span className="label-mono">Signature statement (hero)</span>
          <p className="mt-1 text-xs text-mute">
            The single line over the hero image. One sentence.
          </p>
          <textarea
            name="signatureStatement"
            rows={2}
            defaultValue={settings.signatureStatement}
            className={inputClass}
            placeholder="Add the studio's signature statement"
          />
        </label>

        <label className="mt-5 block">
          <span className="label-mono">Locations</span>
          <p className="mt-1 text-xs text-mute">
            One per line — shown in the hero as &ldquo;Cairo · Egypt&rdquo;. Add or remove lines
            freely.
          </p>
          <textarea
            name="locations"
            rows={3}
            defaultValue={settings.locations.join("\n")}
            className={inputClass}
            placeholder={"Cairo\nEgypt"}
          />
        </label>

        <label className="mt-5 block">
          <span className="label-mono">Statement section — headline</span>
          <input
            name="statementHeadline"
            defaultValue={settings.statementHeadline}
            className={inputClass}
            placeholder="Add the section headline"
          />
        </label>

        <label className="mt-5 block">
          <span className="label-mono">Statement section — body</span>
          <p className="mt-1 text-xs text-mute">
            A short paragraph or a real quote. Blank line separates paragraphs.
          </p>
          <textarea
            name="statementBody"
            rows={5}
            defaultValue={settings.statementBody}
            className={inputClass}
            placeholder="Add the statement, in the architect's own words"
          />
        </label>
      </section>

      <section className="glow-card p-5 sm:p-6">
        <h2 className="label-mono text-amber">The Practice</h2>
        <p className="mt-2 text-xs text-mute">
          A home page section with no page behind it &mdash; how the studio works. It stays
          hidden entirely until at least one of these three has content, so leaving it blank
          costs nothing.
        </p>

        <label className="mt-5 block">
          <span className="label-mono">Headline</span>
          <input
            name="practiceHeadline"
            defaultValue={settings.practiceHeadline}
            className={inputClass}
            placeholder="Add the section headline"
          />
        </label>

        <label className="mt-5 block">
          <span className="label-mono">Body</span>
          <p className="mt-1 text-xs text-mute">
            A short paragraph on the studio&rsquo;s approach, in its own words.
          </p>
          <textarea
            name="practiceBody"
            rows={5}
            defaultValue={settings.practiceBody}
            className={inputClass}
            placeholder="Add the studio's own description of how it works"
          />
        </label>

        <div className="mt-5">
          <span className="label-mono">Image</span>
          <p className="mt-1 text-xs text-mute">
            Optional. Sits beside the text on wide screens and above it on a phone. The section
            still needs text to appear &mdash; an image alone is not a description of the
            practice.
          </p>
          <ImageField
            name="practiceImage"
            initial={settings.practiceImage}
            label="Practice image"
          />
        </div>

        <label className="mt-5 block">
          <span className="label-mono">Disciplines</span>
          <p className="mt-1 text-xs text-mute">
            One per line &mdash; the kinds of work taken on. Rendered as a list beside the
            paragraph, so the section does not read as a second statement block.
          </p>
          <textarea
            name="practiceDisciplines"
            rows={4}
            defaultValue={settings.practiceDisciplines.join("\n")}
            className={inputClass}
            placeholder={"Residential\nCultural\nInterior"}
          />
        </label>
      </section>

      <section className="glow-card p-5 sm:p-6">
        <label className="block">
          <span className="label-mono">Philosophy quote</span>
          <textarea
            name="philosophyQuote"
            rows={3}
            defaultValue={settings.philosophyQuote}
            className={inputClass}
          />
        </label>
      </section>

      {/* Sticky so the confirmation is visible from anywhere in this long form. */}
      <div className="sticky bottom-4 flex justify-start">
        <SaveButton
          state={saveState}
          idleLabel="Save settings"
          onSettled={() => setSaveState("idle")}
          className="border shadow-lg"
        />
      </div>
    </form>
  );
}
