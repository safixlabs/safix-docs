// Reads security.config.json so the published pages and the generated
// SECURITY.md files cannot disagree about a timeline, a scope line, a reward or
// a reporting channel.

import config from "@/security.config.json"

export type Severity = "critical" | "high" | "medium" | "low"

export type SecurityConfig = {
  contact: { email: string | null; githubAdvisories: boolean; pgpFingerprint: string | null }
  disclosure: {
    acknowledgeWithinHours: number
    triageWithinDays: number
    fixTargetDays: Record<Severity, number>
    publicAfterFixDays: number
    maximumEmbargoDays: number
    safeHarbour: boolean
  }
  bounty: {
    live: boolean
    currency: string | null
    rewards: Record<Severity, number | null>
    inScope: string[]
    outOfScope: string[]
  }
  support: {
    channel: string | null
    url: string | null
    responders: string[]
    responseTargetHours: number | null
  }
  openSource: {
    decided: boolean
    decisionDue: string
    repositories: Record<
      string,
      {
        contents: string
        declaredLicense: string | null
        licenseSource: string | null
        opensAt: string | null
      }
    >
  }
}

export const security = (): SecurityConfig => config as unknown as SecurityConfig

export const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"]

/** How a reporter reaches us today, or null while no channel is published. */
export const reportingChannel = (): { kind: "email" | "github"; value: string } | null => {
  const { contact } = security()
  if (contact.email) return { kind: "email", value: contact.email }
  if (contact.githubAdvisories) return { kind: "github", value: "GitHub private security advisories" }
  return null
}

/**
 * Links only to pages this build actually serves. The documentation grows a page
 * at a time and across branches, and a support page that points at a route which
 * does not exist yet is worse than one that says less.
 */
export const linkIfPresent = (href: string, pages: { href: string }[]) =>
  pages.some(page => page.href === href) ? href : null
