export type DocPage = {
  href: string
  title: string
  group: string
}

export const docGroups = ["Introduction", "Protocol", "Network", "Build", "Reference"]

export const docPages: DocPage[] = [
  { href: "/", title: "Overview", group: "Introduction" },
  { href: "/problem/", title: "Problem and solution", group: "Introduction" },
  { href: "/how-it-works/", title: "How it works", group: "Protocol" },
  { href: "/financing/", title: "Financing model", group: "Protocol" },
  { href: "/privacy/", title: "Privacy layer", group: "Protocol" },
  { href: "/passport/", title: "Credit passport", group: "Protocol" },
  { href: "/network/", title: "Network", group: "Protocol" },
  { href: "/economics/", title: "Economics", group: "Network" },
  { href: "/vision/", title: "Vision", group: "Network" },
  { href: "/addresses/", title: "Deployed addresses", group: "Build" },
  { href: "/integration/", title: "Integration guide", group: "Build" },
  { href: "/parameters/", title: "Parameter reference", group: "Build" },
  { href: "/keeper/", title: "Running a keeper", group: "Build" },
  { href: "/risk/", title: "Risk", group: "Reference" },
  { href: "/faq/", title: "FAQ", group: "Reference" },
  { href: "/security/", title: "Security", group: "Reference" },
  { href: "/support/", title: "Support", group: "Reference" }
]

export const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/"
