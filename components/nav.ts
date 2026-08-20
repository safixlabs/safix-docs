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
  { href: "/privacy/", title: "Privacy layer", group: "Protocol" },
  { href: "/passport/", title: "Collateral passport", group: "Protocol" },
  { href: "/economics/", title: "Economics", group: "Network" },
  { href: "/vision/", title: "Vision", group: "Network" }
]

export const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/"
