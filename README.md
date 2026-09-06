# Safix docs

Documentation site for [Safix](https://github.com/safixlabs/safix), the private credit network for tokenized stocks and real-world assets.

Built with Next.js and Tailwind CSS v4, statically exported. Design language matches the Safix site: carbon black canvas, mint accent, DM Sans throughout.

## Development

```
npm install
npm run dev
```

## Build

```
npm run build
```

The static site is written to `out/`.

## The architecture poster

`public/architecture.svg` is the one-page picture of how value moves: who pays
what, in which direction, and which arrows are money rather than permission. It
is served at `/architecture.svg`, with a 1600 by 1000 PNG next to it at
`/architecture.png` for anywhere that cannot render SVG.
