# Replaceable visual assets

Place project artwork here, then set its path in `src/config/visual-assets.ts`.

Example:

```ts
mascot: {
  src: "/assets/hamster-pilot.webp",
  fallback: "🐹",
  alt: "Hamster pilot mascot",
}
```

Pages do not import image files directly. This registry is the single replacement point for visual assets.
