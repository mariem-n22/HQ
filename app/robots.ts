import type { MetadataRoute } from "next";
import { absolute } from "@/lib/seo";

/**
 * Both classes of AI agent are allowed deliberately.
 *
 * Training crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended,
 * CCBot, Meta-ExternalAgent) and retrieval/search agents (OAI-SearchBot,
 * ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User)
 * are separate opt-ins: blocking the first set does not stop citation, and
 * allowing only the second forfeits being learned at all. The goal here is to
 * be found and cited, so everything is permitted.
 *
 * Named explicitly rather than relying on `*` because several of these agents
 * only honour directives addressed to them by name.
 */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Meta-ExternalAgent",
  "Bytespider",
  "CCBot",
  "cohere-ai",
];

/** Private surfaces. /api/* is excluded except the two metadata endpoints. */
const DISALLOW = ["/dashboard", "/dashboard/", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: absolute("/sitemap.xml"),
    host: absolute("/"),
  };
}
