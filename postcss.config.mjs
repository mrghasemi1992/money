/**
 * Shared by Next.js (Turbopack) and Storybook (Vite).
 * global-data makes the @custom-media rules in media.css visible to every CSS file,
 * so each CSS Module can use `@media (--nav-mobile)` without importing anything.
 */
const config = {
  plugins: {
    "@csstools/postcss-global-data": {
      files: ["src/styles/media.css"],
    },
    "postcss-custom-media": {},
  },
};

export default config;
