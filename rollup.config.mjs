import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const dev = process.env.ROLLUP_WATCH === "true";

export default {
  input: "src/flight-map-card.ts",
  output: {
    file: "dist/flight-map-card.js",
    format: "es",
    sourcemap: dev,
    // One file, one Lovelace resource: a code-split chunk would be fetched
    // from a path HACS never registers.
    inlineDynamicImports: true,
  },
  plugins: [
    nodeResolve({ browser: true }),
    typescript({ tsconfig: "./tsconfig.json" }),
    // Lit 3 requires ES2022+: terser must not downlevel class syntax.
    terser({ ecma: 2022, format: { comments: false } }),
  ],
};
