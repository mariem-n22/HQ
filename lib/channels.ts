import type { IconType } from "react-icons";
import { SiGithub, SiInstagram, SiWhatsapp } from "react-icons/si";
// LinkedIn is not in simple-icons v5 — Font Awesome still carries the mark.
import { FaLinkedinIn } from "react-icons/fa6";
import { Mail, Phone } from "lucide-react";
import { isTodo, type SiteSettings } from "@/lib/types";

export type Channel = {
  key: string;
  label: string;
  /** What a human reads — the handle, address or number. */
  value: string;
  href: string;
  Icon: IconType;
  /** Brand hover colour, expressed as a token class. */
  hover: string;
};

/** `+20 105 5210373` → `https://wa.me/201055210373` */
export function waLink(phone: string) {
  const digits = phone.replace(/[^\d]/g, "").replace(/^0+/, "");
  return digits ? `https://wa.me/${digits}` : "";
}

/**
 * Turns the SiteSettings singleton into the channel list. Anything still
 * holding a `[[TODO: …]]` placeholder is dropped rather than rendered as a
 * dead link.
 */
export function channelsOf(settings: SiteSettings | null): Channel[] {
  if (!settings) return [];
  const whatsappHref = isTodo(settings.whatsapp)
    ? isTodo(settings.phone)
      ? ""
      : waLink(settings.phone)
    : settings.whatsapp;

  const all: Channel[] = [
    {
      key: "github",
      label: "GitHub",
      value: settings.github,
      href: settings.github,
      Icon: SiGithub,
      hover: "hover:text-amber",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      value: settings.linkedin,
      href: settings.linkedin,
      Icon: FaLinkedinIn,
      hover: "hover:text-amber",
    },
    {
      key: "instagram",
      label: "Instagram",
      value: settings.instagram,
      href: settings.instagram,
      Icon: SiInstagram,
      hover: "hover:text-amber",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      value: isTodo(settings.phone) ? whatsappHref : settings.phone,
      href: whatsappHref,
      Icon: SiWhatsapp,
      hover: "hover:text-amber",
    },
    {
      key: "phone",
      label: "Phone",
      value: settings.phone,
      href: isTodo(settings.phone) ? "" : `tel:${settings.phone.replace(/[^\d+]/g, "")}`,
      Icon: Phone as IconType,
      hover: "hover:text-amber",
    },
    {
      key: "email",
      label: "Email",
      value: settings.email,
      href: isTodo(settings.email) ? "" : `mailto:${settings.email}`,
      Icon: Mail as IconType,
      hover: "hover:text-amber",
    },
  ];

  return all.filter((channel) => Boolean(channel.href) && !isTodo(channel.href));
}
