import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SectorPage } from "@/components/hq/SiteShell";
import { ChannelRows } from "@/components/hq/ChannelRows";
import { ContactForm } from "@/components/hq/ContactForm";
import { Reveal } from "@/components/hq/Reveal";
import { getSettings, isTodo } from "@/lib/data";
import { channelsOf } from "@/lib/channels";

export const metadata: Metadata = pageMeta({
  title: "Contact the studio",
  description: "Reach the studio about a commission, a competition or a collaboration.",
  path: "/contact",
});

/** The handle from the email local-part, else the standing wordmark. */
function wordmarkOf(email: string | undefined) {
  if (email && !isTodo(email) && email.includes("@")) {
    const local = email.split("@")[0]?.replace(/[^a-zA-Z]/g, "");
    if (local && local.length >= 3) return local.toUpperCase();
  }
  return "STUDIO";
}

export default async function ContactPage() {
  const settings = await getSettings();
  const channels = channelsOf(settings);
  const closing = channels.find((c) => c.key === "whatsapp") ?? channels.find((c) => c.key === "email");

  return (
    <SectorPage>
      <header className="text-center">
        <p className="label-mono text-amber">// Let&rsquo;s connect</p>
        <h1 className="display-title mx-auto mt-5 max-w-4xl text-5xl leading-[1.05] text-ink sm:text-7xl">
          Ready to build <span className="text-amber">something great?</span>
        </h1>
        <p className="standfirst mx-auto mt-6 max-w-2xl text-[15px]">
          Whether you have a project in mind, want to collaborate, or just want to say hello —
          I&rsquo;d love to hear from you.
        </p>
      </header>

      <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <Reveal>
          <h2 className="display-title text-3xl text-ink">Let&rsquo;s turn your vision into reality</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mute">
            The studio takes on residential, cultural, hospitality and urban work, from early
            feasibility through to construction. Tell us what you are trying to build, the site and
            the constraints, and we will tell you plainly whether the practice is the right fit.
          </p>
          <div className="mt-8">
            <ChannelRows settings={settings} />
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div id="message-form" className="scroll-mt-24">
            <ContactForm />
          </div>
        </Reveal>
      </div>

      <Reveal as="section" className="mt-24 border-t border-line pt-16 text-center">
        <h2 className="display-title text-4xl text-ink sm:text-5xl">
          Let&rsquo;s build something <span className="text-amber">extraordinary</span>
        </h2>
        <p className="standfirst mx-auto mt-4 max-w-xl text-[15px]">
          Ready to bring your vision to life? I&rsquo;m always excited to work on projects that
          challenge the status quo.
        </p>
        <a
          href={closing?.href ?? "#message-form"}
          target={closing?.href.startsWith("http") ? "_blank" : undefined}
          rel={closing?.href.startsWith("http") ? "noreferrer" : undefined}
          className="mt-8 inline-block rounded-md border border-amber bg-ink px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-base transition-opacity hover:opacity-90"
        >
          Start a conversation
        </a>
      </Reveal>

      <div aria-hidden className="mt-20 overflow-hidden">
        <p className="display-title select-none text-center text-[22vw] leading-none text-ink/[0.05]">
          {wordmarkOf(settings?.email)}
        </p>
      </div>
    </SectorPage>
  );
}
