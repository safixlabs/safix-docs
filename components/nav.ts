export type DocPage = {
  href: string
  title: string
  group: string
}

export const docGroups = ["Introduction", "Protocol", "Network"]

export const docPages: DocPage[] = [
  { href: "/", title: "Overview", group: "Introduction" },
  { href: "/problem/", title: "Problem and solution", group: "Introduction" },
  { href: "/how-it-works/", title: "How it works", group: "Protocol" },
  { href: "/financing/", title: "Financing model", group: "Protocol" },
  { href: "/privacy/", title: "Privacy layer", group: "Protocol" },
  { href: "/passport/", title: "Credit passport", group: "Protocol" },
  { href: "/network/", title: "Network", group: "Protocol" },
  { href: "/economics/", title: "Economics", group: "Network" },
  { href: "/vision/", title: "Vision", group: "Network" }
]

export const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/"
